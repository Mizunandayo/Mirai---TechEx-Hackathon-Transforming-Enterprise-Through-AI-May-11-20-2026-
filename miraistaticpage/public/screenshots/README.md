# Screenshots

Drop your Mirai app screenshots here.

Then replace each `<ImagePlaceholder>` in the component with:

```jsx
<img
  src="/screenshots/your-filename.png"
  alt="Description"
  className="w-full rounded-2xl mt-4 shadow-lg"
/>
```

## Suggested screenshots

| File name                  | Component         | Location                          |
|----------------------------|-------------------|-----------------------------------|
| `hero-app.png`             | Hero.jsx          | Right column (app overview)       |
| `workflow-pipeline.png`    | Workflow.jsx      | Below 6-step pipeline             |
| `gemini-ai-results.png`    | Gemini.jsx        | AI Results panel                  |
| `feature-voice-ai.png`     | Features.jsx      | Voice + AI bento card             |
| `feature-simulation.png`   | Features.jsx      | Dual Physics bento card           |
| `feature-community.png`    | Features.jsx      | Community Library bento card      |
| `feature-presets.png`      | Features.jsx      | Robot Presets bento card          |
| `demo-step-1.png`          | Demo.jsx          | Step 1 card                       |
| `demo-step-2.png`          | Demo.jsx          | Step 2 card                       |
| `demo-step-3.png`          | Demo.jsx          | Step 3 card                       |
| `demo-step-4.png`          | Demo.jsx          | Step 4 card                       |
| `demo-step-5.png`          | Demo.jsx          | Step 5 card                       |
| `demo-step-6.png`          | Demo.jsx          | Step 6 card                       |

## YouTube video

In `Demo.jsx`, find:

```jsx
<YouTubePlaceholder title="..." />
```

Replace with:

```jsx
<YouTubePlaceholder videoId="YOUR_YOUTUBE_VIDEO_ID" title="Mirai Demo" />
```

The video ID is the part after `?v=` in the YouTube URL.
