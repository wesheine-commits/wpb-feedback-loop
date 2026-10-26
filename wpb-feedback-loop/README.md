# WPB Feedback Loop on Netlify

Staff open the link, enter the **team code**, tap their team, and log it. Every entry saves on Netlify. The **Dashboard** opens with the **leader code**, and only leaders see call out names.

## What's in this folder

- `public/index.html` is the app itself
- `netlify/functions/entries.mjs` saves and loads entries
- `netlify.toml` and `package.json` tell Netlify how to run it

## Step 1. Put the folder on GitHub (about 3 minutes)

1. Go to github.com and sign in (or make a free account).
2. Click **New** (green button, top left) to make a new repository.
3. Name it `wpb-feedback-loop`, choose **Private**, then click **Create repository**.
4. On the next screen, click **uploading an existing file**.
5. Unzip the folder you got from Claude. Open it, select **everything inside** (`public`, `netlify`, `netlify.toml`, `package.json`, `README.md`) and drag it onto the GitHub page.
6. Click **Commit changes**.

## Step 2. Connect it to Netlify (about 3 minutes)

1. Go to app.netlify.com and sign in.
2. Click **Add new project**, then **Import an existing project**, then **GitHub**.
3. Allow Netlify to see your GitHub, then pick `wpb-feedback-loop`.
4. Leave the build settings as they are. Netlify reads them from the folder.
5. Before you click Deploy, find **Environment variables** and add two:
   - `TEAM_CODE`: the code staff will use, for example `wpb2026`
   - `LEADER_CODE`: your private dashboard code, for example something only you and Dave know
6. Click **Deploy**. It takes about a minute.

If you skipped step 5, add the codes under **Project configuration > Environment variables**, then go to **Deploys** and click **Trigger deploy**.

## Step 3. Give it a clean name

**Project configuration > General > Change project name** gives you something like `wpb-feedback.netlify.app`.

## Step 4. Share it

Send staff the link and the team code. Keep the leader code for you and anyone you want on the dashboard.

## Making changes later

Edit a file on GitHub (or upload a new version) and Netlify updates the live site on its own in about a minute. To change a code, update the environment variable and trigger a new deploy. Everyone with the old code will be asked for the new one.
