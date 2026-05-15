# server/models/validators.py

import math
from typing import List, Tuple, Optional
from .schemas import TaskSpec, TaskStep, ArmContextDTO, ValidationError, PreFlightReport




class ReachValidator:
    """Check if arm can reach target XYZ positions."""
    
    
    @staticmethod
    def can_reach(x: float, y: float, z: float, max_reach: float) -> Tuple[bool, Optional[str]]:
        """
        AABB reach check: is target within max reach sphere?
        
        Args:
            x, y, z: target position
            max_reach: arm max reach from base
        
        Returns:
            (is_reachable, error_message)
        """
        distance = math.sqrt(x**2 + y**2 + z**2)
        
        if distance > max_reach:
            return False, f"Target ({x:.2f}, {y:.2f}, {z:.2f}) is {distance:.2f}m away, but max reach is {max_reach:.2f}m"
        
        if y < 0:
            return False, f"Target Y={y:.2f}m is below work table (Y>=0)"
        
        return True, None

class PayloadValidator:
    """Check if gripper can handle object weight."""
    
    @staticmethod
    def can_lift(mass_kg: float, payload_limit_kg: float, step_type: str) -> Tuple[bool, Optional[str]]:
        """
        Validate gripper payload capacity.
        
        Args:
            mass_kg: object mass
            payload_limit_kg: arm limit
            step_type: "grip", "move", etc.
        """
        if mass_kg > payload_limit_kg:
            return False, f"Object mass {mass_kg}kg exceeds gripper limit {payload_limit_kg}kg"
        
        return True, None

class CollisionRiskValidator:
    """Detect obvious collision risks."""
    
    @staticmethod
    def check_self_collision_risk(x: float, y: float, z: float) -> Tuple[bool, Optional[str]]:
        """
        Simple self-collision heuristic: arm reaching backwards over itself.
        (Full collision is checked by Rapier during simulation)
        """
        # If moving to negative X and Z is high, risk is higher
        if x < -0.1 and z > 0.8:
            return False, "Arm may self-collide when reaching far backward at high Z"
        if y < 0.02 and abs(x) > 0.45:
            return False, "Tool path is very low and far from base; high risk of clipping table or supports"
        
        return True, None

class PreconditionValidator:
    """Check step preconditions (gripper must be open before close, etc.)."""
    
    @staticmethod
    def validate_gripper_sequence(steps: List[TaskStep]) -> List[Tuple[int, str]]:
        """
        Validate gripper state transitions.
        
        Rules:
        - Cannot close if already closed
        - Cannot open if already open
        - Cannot move with gripper in transition
        """
        errors = []
        gripper_closed = False
        
        for i, step in enumerate(steps):
            if step.type == "grip":
                if step.action == "close" and gripper_closed:
                    errors.append((i, "Cannot close gripper—already closed"))
                if step.action == "open" and not gripper_closed:
                    errors.append((i, "Cannot open gripper—already open"))
                
                gripper_closed = (step.action == "close")
        
        return errors

    @staticmethod
    def validate_pick_sequence(steps: List[TaskStep]) -> List[Tuple[int, str]]:
        """
        Ensure gripping logic exists for object manipulation.

        Rules:
        - A close action should generally be preceded by a move step.
        - If a close exists, at least one move should happen after close (carry phase).
        """
        errors: List[Tuple[int, str]] = []
        has_close = False
        close_index = -1

        for i, step in enumerate(steps):
            if step.type == "grip" and step.action == "close":
                has_close = True
                close_index = i
                prev_move = i > 0 and steps[i - 1].type == "move"
                if not prev_move:
                    errors.append((i, "Grip close should be preceded by a move to a pickup pose"))

        if has_close:
            has_carry_move = any(s.type == "move" for s in steps[close_index + 1 :])
            if not has_carry_move:
                errors.append((close_index, "No carry move found after gripping; object pickup flow is incomplete"))

        return errors

    @staticmethod
    def validate_pick_target_consistency(steps: List[TaskStep]) -> List[Tuple[int, str, str]]:
        """
        Enforce one pickup target before first grip close.

        Returns tuples: (step_index, offending_target, expected_target).
        """
        first_close_index = next(
            (i for i, step in enumerate(steps) if step.type == "grip" and step.action == "close"),
            -1,
        )
        if first_close_index <= 0:
            return []

        expected_target: Optional[str] = None
        violations: List[Tuple[int, str, str]] = []

        for i in range(first_close_index):
            step = steps[i]
            if step.type != "move":
                continue
            target = (step.target_name or "").strip()
            if not target:
                continue

            if expected_target is None:
                expected_target = target
                continue

            if target != expected_target:
                violations.append((i, target, expected_target))

        return violations

class SafetyValidator:
    """Orchestrates all pre-flight checks."""
    
    @staticmethod
    def validate_task_spec(task_spec: TaskSpec, arm_context: ArmContextDTO) -> PreFlightReport:
        """
        Run all safety checks on a TaskSpec.
        
        Returns:
            PreFlightReport with is_safe flag + list of errors
        """
        errors = []
        warnings = []
        
        # Check gripper sequence
        gripper_errors = PreconditionValidator.validate_gripper_sequence(task_spec.steps)
        for step_idx, error_msg in gripper_errors:
            errors.append(ValidationError(
                step_index=step_idx,
                step_type="grip",
                error_code="precondition_unmet",
                message=error_msg
            ))

        pick_errors = PreconditionValidator.validate_pick_sequence(task_spec.steps)
        for step_idx, error_msg in pick_errors:
            errors.append(ValidationError(
                step_index=step_idx,
                step_type="grip",
                error_code="precondition_unmet",
                message=error_msg,
                suggested_fix="Insert a move-to-target step before close, then add a carry move after close"
            ))

        target_consistency_errors = PreconditionValidator.validate_pick_target_consistency(task_spec.steps)
        for step_idx, offending_target, expected_target in target_consistency_errors:
            errors.append(ValidationError(
                step_index=step_idx,
                step_type="move",
                error_code="object_consistency",
                message=(
                    f"Move target '{offending_target}' conflicts with pickup target '{expected_target}' before grip-close"
                ),
                suggested_fix=(
                    f"Use pickup target '{expected_target}' for all pre-close move steps"
                )
            ))
        
        # Check each move step for reach + collision risk
        for step_idx, step in enumerate(task_spec.steps):
            if step.type == "move":
                # Reach check
                can_reach, reach_error = ReachValidator.can_reach(
                    step.x, step.y, step.z, arm_context.max_reach
                )
                if not can_reach:
                    errors.append(ValidationError(
                        step_index=step_idx,
                        step_type="move",
                        error_code="reach_violation",
                        message=reach_error,
                        suggested_fix=f"Reduce Z or move target closer (max reach: {arm_context.max_reach}m)"
                    ))
                
                # Collision risk heuristic
                is_safe, collision_msg = CollisionRiskValidator.check_self_collision_risk(
                    step.x, step.y, step.z
                )
                if not is_safe:
                    errors.append(ValidationError(
                        step_index=step_idx,
                        step_type="move",
                        error_code="collision_risk",
                        message=collision_msg,
                        suggested_fix="Add approach/retreat waypoints and increase tool height before lateral travel"
                    ))
            
            # Payload check during grip
            if step.type == "grip" and step.action == "close":
                can_lift, payload_msg = PayloadValidator.can_lift(1.5, arm_context.payload_limit, "grip")
                if not can_lift:
                    errors.append(ValidationError(
                        step_index=step_idx,
                        step_type="grip",
                        error_code="payload_violation",
                        message=payload_msg
                    ))
        
        return PreFlightReport(
            is_safe=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )