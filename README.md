# OS Yamato 🌸

> A gentle operating system where data blooms, fades, and returns to the wind.
>
> Even the quietest message can carry the weight of a season.

<p align="center">
  <img src="https://github.com/user-attachments/assets/f2c89d5f-f3c7-4f5a-818a-e8c3a40f4d9d" width="300" />
</p>

---

## 🌿 Philosophy

We believe that digital memories, like real ones, shouldn't last forever by default.  
**OS Yamato** introduces a mindful approach: notes, photos, messages —  
if left untouched, they will gently fade and disappear after one year.

- No hoarding.  
- No clutter.  
- Just meaningful moments.

---

## 🖼️ How It Works

- Each data object (note, photo, contact...) includes a `lastOpenedAt` timestamp.
- If it hasn't been opened for **330 days**, the UI shows a 🥀 icon.
- If unopened for **365 days**, it is **automatically deleted** from storage.


---

## ⚙️ Tech Stack

- 🖥️ **Frontend**: Vue 3 + Vite  
- ☁️ **Backend**: AWS Amplify (Cognito / AppSync / DynamoDB / S3)  
- 🧠 **Data Lifecycle**: TTL-based expiration logic with visual feedback  
- 🌍 **Hosting**: Amplify Hosting + Global CDN  
- 💡 **Design Ethos**: Inspired by impermanence and wabi-sabi aesthetics

---

## 🚀 Getting Started (for Developers)

```bash
git clone https://github.com/YOUR_USERNAME/os-yamato.git
cd os-yamato
npm install
npm run dev
