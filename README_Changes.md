# Homework 5: Youtube AI Chat Assistant

In this assignment, you will add features and AI chat tools to the chat app from class to make it a Youtube AI Chat Assistant.

Clone the chat app ([4] github.com), then implement the following features:

Important Tool Requirement: For every Chat Tool implemented, you must explicitly define and describe its purpose in `public/prompt_chat.txt`. This helps the AI understand what tools are available to it.

Required Tool Names (use these exact names for grading):

  * `generateImage` — image generation from text prompt and anchor image  
  * `plot_metric_vs_time` — plot any numeric field (views, likes, comments, etc.) vs time for channel videos  
  * `play_video` — play a video from channel data (title + thumbnail, opens in new tab)  
  * `compute_stats_json` — mean, median, std, min, max for any numeric field in channel JSON  

## Task Instructions

1. Chat personalization:
   * Add First Name and Last Name to the Create Account form.
   * Save the first and last name in the database.
   * After logging in, put the first and last name in the chat context so the AI knows who they are talking to.
   * Change the system prompt so the AI addresses the user by name in the first message.
2. YouTube Channel Data Download Tab:
   * After logging in, add a tab to the app called "YouTube Channel Download".
   * On this page the user can enter a URL of a YouTube channel page (e.g. https://www.youtube.com/@veritasium).
   * There is a Download Channel Data button and a max videos input field (default 10, max 100).
   * When clicked, the app downloads metadata for the channel videos, including title, description, transcript (if available), duration, release date, view count, like count, comment count, and video URL for the max number of videos the user specifies. The data is saved to a JSON file that can be downloaded by the user.
   * Display a progress bar while downloading.
   * Download the channel data for 10 videos from https://www.youtube.com/@veritasium and save it to your public folder so you (and the grader) know it works.
3. JSON chat input:
   * Allow the user to drag the JSON file into the chat and load it into the conversation context.
   * Save it locally so you can run code on it later.
   * Update the system prompt so the AI knows how to deal with JSON files.
4. Chat Tool: `generateImage`:
   * Allow the user to generate an image in the chat based on a text prompt and an anchor image dragged in.
   * Display the image in the chat.
   * Make it so you can download the image and when you click on it, it enlarges to be easier to see.
   * Described in `prompt_chat.txt`.
5. Chat Tool: `plot_metric_vs_time`:
   * Create a chat tool that allows the user to plot any numeric field (views, likes, comments, etc.) vs time for the channel videos via chat.
   * Make the plot a React component displayed in the chat.
   * When the user clicks on the plot it enlarges to be easier to see and has a download button.
   * Described in `prompt_chat.txt`.
6. Chat Tool: `play_video`:
   * Create a chat tool that allows the user to play a YouTube video in the chat.
   * When the user asks to "play" or "open" a video from the loaded channel data, display a clickable card with the video title and thumbnail.
   * Clicking opens the video in a new tab on YouTube.
   * The user can specify which video by title (e.g. "play the asbestos video"), ordinal (e.g. "play the first video"), or "most viewed".
   * Described in `prompt_chat.txt`.
7. Chat Tool: `compute_stats_json`:
   * Create a chat tool that computes mean, median, std, min, and max for any numeric field in the channel JSON (e.g. view_count, like_count, comment_count, duration).
   * Call it when the user asks for statistics, average, or distribution of a numeric column.
   * Described in `prompt_chat.txt`.
8. Prompt engineering:
   * Update the system prompt in `prompt_chat.txt` to tell the AI it is a YouTube analyze assistant.
   * The prompt should explain that the AI will receive JSON files of YouTube channel data.
   * The prompt should explain that the AI has access to tools to analyze the data and generate content.

## Submission Checklist

Push your code to your GitHub repository and submit the URL to the assignment on Canvas.

## Grading Breakdown (100 Points)

Task Component | Points | Requirement
---|---:|---
1. Chat personalization | 10 | First Name and Last Name are added to the Create Account form, saved in the database, and used in the chat context.
2. YouTube Channel Data Download Tab | 20 | Tab is functional with URL input, max videos field, progress bar, and JSON download.
3. JSON chat input | 10 | User can drag JSON into chat; it loads into context and is available for code execution. Described in `prompt_chat.txt`.
4. Chat Tool: `generateImage ` | 10 | Image generation from text prompt and anchor image works; images display in chat with download and lightbox. Described in `prompt_chat.txt`.
5. Chat Tool: `plot_metric_vs_time ` | 15 | Plot metric vs time tool works with channel JSON; chart is a React component displayed in chat with enlarge and download. Described in `prompt_chat.txt`.
6. Chat Tool: `play_video ` | 15 | Play video tool shows video title and thumbnail; click opens in new tab. Described in `prompt_chat.txt`.
7. Chat Tool: `compute_stats_json ` | 10 | Stats tool computes mean, median, std, min, max for numeric fields in channel JSON. Described in `prompt_chat.txt`.
8. Prompt engineering | 5 | System prompt tells the AI it is a YouTube analyze assistant, will receive JSON files of channel data, and has tools to analyze data and generate content.
9. Proper Submission | 5 | Code is pushed to GitHub and the URL is submitted to the assignment on Canvas.