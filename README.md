# ⚡ FirmForge

> **AI-powered firmware code generator for embedded engineers.**

Generate production-ready embedded C code for STM32, ESP32, Arduino, and more — from peripheral snippets to full RTOS architectures. Built for ECE engineers who need correct register maps, proper HAL configurations, and FreeRTOS task architectures, fast.

---

## 🚀 Features

### ⚡ Snippet Generator
- Select MCU, peripheral, and code style
- Configure parameters (baud rate, pins, clock speed)
- Get syntax-highlighted C code with correct register maps
- Download as `.c` file with one click

### 🧠 RTOS Architect
- Describe firmware behavior in plain English
- Choose your RTOS (FreeRTOS, Zephyr, or bare-metal)
- Get multi-file output: `main.c`, `tasks.h`, `config.h`
- Includes task priorities, queues, and semaphores

### 📋 Supported Platforms
| MCU | UART | SPI | I2C | ADC | DAC | GPIO | Timer | INT | DMA | WDT |
|-----|------|-----|-----|-----|-----|------|-------|-----|-----|-----|
| STM32F103 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| STM32F4xx | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| STM32H7xx | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ESP32 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ESP8266 | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | ✅ |
| Arduino UNO | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | ✅ |
| Arduino Mega | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | ✅ |
| RP2040 | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| nRF52840 | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + custom "Industrial Precision" theme
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (button, card, badge, tabs, select, input, textarea, tooltip, separator, switch)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Fonts:** JetBrains Mono · Syne · DM Sans (via `next/font`)
- **Deployment:** Vercel-ready (no custom server)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout (navbar, footer, fonts)
│   ├── page.tsx             # Landing page
│   ├── generate/
│   │   └── page.tsx         # Main app (snippet + RTOS tabs)
│   └── docs/
│       └── page.tsx         # MCU support matrix
├── components/
│   ├── navbar.tsx           # Sticky navbar with blur backdrop
│   ├── footer.tsx           # Footer with links
│   ├── code-block.tsx       # Reusable code display with syntax highlighting
│   ├── mcu-badge.tsx        # MCU chip badge component
│   ├── snippet-generator.tsx # Snippet Generator tab
│   ├── rtos-architect.tsx   # RTOS Architect tab
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── constants.ts         # MCU list, peripheral list, dropdown data, demo code
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Utility functions
└── styles/
    └── globals.css          # (CSS is in app/globals.css)
```

---

## 🎨 Design System

**Theme: "Industrial Precision"** — dark background, monospace code aesthetics, engineering instrument feel.

| Token | Value |
|-------|-------|
| Background | `#0A0A0F` |
| Surface | `#12121A` |
| Border | `#1E1E2E` |
| Cyan Accent | `#00D4FF` |
| Violet Accent | `#7C3AED` |
| Success | `#00FF88` |
| Text Primary | `#E8E8F0` |
| Text Muted | `#6B6B8A` |

**Fonts:**
- `JetBrains Mono` — code, labels, inputs
- `Syne` — headings
- `DM Sans` — body text

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🚢 Deployment

This project is Vercel-ready. Simply connect your GitHub repo to [Vercel](https://vercel.com) and deploy.

```bash
# Or deploy via CLI
npx vercel
```

---

## 🏆 HackIndia 2026

Built with ❤️ for **HackIndia 2026** — India's Largest AI & Web3 Hackathon.

**Team:** No_Name

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
