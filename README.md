# FirmForge: AI-Powered Firmware Generation and RTOS Workspace  Architect

FirmForge is an enterprise-grade web application designed for electrical, computer, and embedded systems engineering professionals. It provides automated, context-aware code generation for a wide range of microcontroller units (MCUs) and peripherals, along with a multi-file Real-Time Operating System (RTOS) architect. By integrating advanced prompt engineering with streaming Google Gemini API capabilities, FirmForge delivers production-ready C firmware directly into an interactive development workspace.

Styled under the "Industrial Precision" design system, FirmForge replicates the interface of high-end engineering instruments, such as oscilloscopes and logic analyzers, featuring a dark aesthetic with grid alignments, monospace labels, and custom digital indicators.

---

## Table of Contents

1. [Project Overview and Vision](#project-overview-and-vision)
2. [System Architecture and Data Flow](#system-architecture-and-data-flow)
3. [Key Features](#key-features)
   - [Dynamic Snippet Generator](#dynamic-snippet-generator)
   - [RTOS Architect Workspace](#rtos-architect-workspace)
4. [Application Interface Screenshots](#application-interface-screenshots)
5. [Microcontroller and Peripheral Support Matrix](#microcontroller-and-peripheral-support-matrix)
6. [Technical Stack](#technical-stack)
7. [API Reference](#api-reference)
   - [POST /api/generate-snippet](#post-apigenerate-snippet)
   - [POST /api/generate-rtos](#post-apigenerate-rtos)
8. [Project Directory Structure](#project-directory-structure)
9. [Design System Specifications](#design-system-specifications)
10. [Setup and Installation](#setup-and-installation)
11. [Deployment and Serverless Configuration](#deployment-and-serverless-configuration)
12. [Security and Rate Limiting](#security-and-rate-limiting)
13. [HackIndia 2026 Team Attribution](#hackindia-2026-team-attribution)
14. [License](#license)

---

## Project Overview and Vision

### The Problem: Why is Firmware Development Hard?

Embedded systems development is one of the most technically demanding disciplines in electronics and computer engineering. Every time an engineer needs to initialize a peripheral—whether it is a UART interface, an SPI sensor, or an I2C display—they must manually cross-reference dense, hundreds-of-pages-long datasheets, look up exact register names and bit masks for their specific microcontroller, and write repetitive boilerplate initialization code from scratch. For a single STM32 UART setup, this process can take 30–45 minutes even for an experienced engineer.

The problem gets significantly worse when building real-time systems. Designing a FreeRTOS-based firmware architecture—with multiple tasks, queues, semaphores, and proper scheduling priorities—requires deep knowledge of RTOS internals, MCU-specific APIs, and careful system design. Most ECE students and junior engineers spend more time writing boilerplate and configuration than actually solving their core engineering problem.

Existing tools like ChatGPT and GitHub Copilot attempt to help, but they fail in this domain for a critical reason: they are general-purpose. They regularly hallucinate wrong register names, generate code for the wrong MCU variant, mix up HAL and bare-metal APIs, and produce incomplete implementations that silently break at runtime. There is no focused, reliable, domain-specific tool built for embedded firmware generation.

### The Solution: The "EmbeddedPilot" Vision

FirmForge solves this problem directly. It is a web-based AI developer tool purpose-built for ECE engineers and embedded systems developers, implementing the **"EmbeddedPilot"** vision of natural language to hardware orchestration. It provides two core workspace components:

1. **Peripheral Snippet Generator**: An engineer selects their MCU (STM32F4, ESP32, Arduino, RP2040, nRF52840 and more), selects a peripheral (UART, SPI, I2C, ADC, DMA, Timers, GPIO, Interrupts, Watchdog, DAC), fills in specific parameters like baud rate, pin numbers, clock speed, and code style preference (HAL, bare-metal registers, or Arduino IDE), and clicks generate. FirmForge streams back complete, commented, copy-paste-ready C code in seconds—correctly matched to that specific MCU's register map and toolchain.
2. **RTOS Architect Workspace**: An engineer describes their firmware behavior in plain English—for example, "Read temperature from DHT22 every 2 seconds, apply a moving average filter using a FreeRTOS task, and publish via MQTT over WiFi. Trigger a GPIO alarm if temperature exceeds 35°C." FirmForge generates a complete, multi-file firmware project: `main.c` with full peripheral initialization and task creation, `tasks.h` with all task declarations and RTOS handles, and `config.h` with all constants, pin definitions, and RTOS configuration. All three files stream in live and are downloadable.

This is exactly where vibe coding meets hardware engineering. Instead of a developer writing every register configuration manually, they describe the outcome they want and the EmbeddedPilot engine handles the implementation. The barrier to building embedded systems is dramatically reduced—making hardware development accessible to students, makers, and software developers who want to work with microcontrollers but get stuck at the firmware layer.

### The Tech: High-Performance Architecture

FirmForge is built using a modern, stream-optimized technical stack:
* **Next.js**: The core framework driving the application, utilizing the App Router paradigm to manage dynamic layouts, state management, and stream consumer structures.
* **Google Gemini API**: Generates MCU-specific C-code using advanced system engineering prompts. The system features a resilient fallback chain traversing `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-flash-latest` to guarantee service availability even during high-demand periods.
* **Vercel**: Deployed on Vercel with optimized serverless function durations (up to 120 seconds) to ensure complex, multi-file RTOS workspaces can stream entirely without connection termination.

---

## System Architecture and Data Flow

FirmForge is designed with a decoupled client-server architecture. The user interface manages application state, dynamic configurations, streaming HTTP client consumption, and layout rendering. The backend server manages prompt synthesis, parameter validation, error boundaries, and streaming integration with the Google Gemini API.

Below is the detailed data flow mapping of the code generation pipeline:

![System Data Flow Diagram](public/data_flow_diagram.png)

### Data Flow Execution Steps

#### Single-File Snippet Generation Flow
1. **Configuration Input**: The user selects the target MCU, peripheral interface, code style, and fills out peripheral-specific parameters (e.g., baud rate, clock speed, pins).
2. **HTTP POST Request**: The UI packages these settings into a JSON payload and dispatches a POST request to `/api/generate-snippet`.
3. **Synthesis and Streaming**: The backend compiles user options into a system engineering prompt, invokes the Google Gemini API (`gemini-2.0-flash`) via the generative AI SDK, transforms the response stream into a raw chunked stream, and pipes it back to the client.
4. **Client-Side Rendering**: The client reads the stream progressively using the Streams API and updates the UI's code block, complete with typing animations.

#### Multi-File RTOS Workspace Generation Flow
1. **Project Definition**: The user enters a natural language description of the firmware's runtime requirements, selects an MCU and an RTOS, and configures auxiliary options (e.g., scheduling diagrams, header inclusions, comments).
2. **Multi-File Prompt Composition**: The UI sends a POST request to `/api/generate-rtos`. The API route constructs a rigorous system prompt instructing Claude to generate exactly three files (`main.c`, `tasks.h`, `config.h`) wrapped in strict delimiters (`===FILE:filename===` and `===END===`).
3. **Delimiter-Delimited Streaming**: The backend streams the raw text response from the Claude API, containing all three files sequentially inside the delimiters.
4. **Regex Stream Parser**: On the client, a regular expression parser continuously parses the incoming text buffer in real time:
   - `main.c` is captured via: `/===FILE:main\.c===([\s\S]*?)(?:===FILE:|===END===|$)/`
   - `tasks.h` is captured via: `/===FILE:tasks\.h===([\s\S]*?)(?:===FILE:|===END===|$)/`
   - `config.h` is captured via: `/===FILE:config\.h===([\s\S]*?)(?:===FILE:|===END===|$)/`
5. **Interactive UI Update**: The front-end renders these components in real time. Tabs correspond to each file, showing a spinning loader if the file is currently streaming, a grey dot if idle, and a green dot when generation is complete.

---

## Key Features

### Dynamic Snippet Generator
* **Context-Aware Forms**: The generator adapts its input forms dynamically based on the selected peripheral. Form definitions are loaded from schemas in `src/lib/peripheral-params.ts`, ensuring that only relevant hardware parameters are requested.
* **Stream-Optimized Rendering**: Outputs stream line-by-line in a terminal shell visualizer, preventing page freezing and ensuring immediate code visibility.
* **Export Utilities**: Supports instant copy-to-clipboard functionality and direct file downloading (.c format) named according to the selected configuration.
* **Token Metrics**: Features real-time token tracking displaying the count of generated lines and characters.

### RTOS Architect Workspace
* **Natural Language to Firmware**: Translates English behavioral descriptions (e.g., "Read ADC channels every 100ms and stream over UART with mutex locks") into scheduled multi-threaded software.
* **Cohesive Multi-File Generation**: Simultaneously outputs three critical files required for embedded compilation:
  * `main.c`: Coordinates peripheral initialization, registers RTOS queues/mutexes, instantiates tasks, and starts the scheduler.
  * `tasks.h`: Declares task prototypes, external resources, queue and semaphore handles, and task parameter structures.
  * `config.h`: Declares physical pin assignments, software timing delays, buffer limits, interrupt priorities, and threshold macros.
* **State and Streaming Tracking**: Each tab features a dedicated visual indicator that reflects whether a file is idle, actively streaming, or complete. A global progress bar displays indeterminate progress during operation.
* **Workspace Stats Dashboard**: Analyzes the generated code segments to display lines of code, characters, and function count in real time.
* **Single and Batch Downloads**: Allows developers to copy or download individual files, or batch download the entire generated workspace at once.

---

## Application Interface Screenshots

This section presents the graphical user interfaces and operational flows of the FirmForge platform.

### Dynamic Snippet Generator

The Dynamic Snippet Generator provides developers with an interface to construct driver code for specific peripherals.

#### Configuration Input Panel
The configuration interface enables selection of the microcontroller unit, peripheral, and code structure style. Dynamic forms render hardware-specific parameters based on the selected peripheral configuration.

![Dynamic Snippet Generator Configuration](Screenshots/Screenshot%202026-06-02%20164525.png)

#### Generated Output View
Once code generation is completed, the result is streamed. The interface displays line numbers, syntax highlighting, copying options, and direct file download mechanisms.

![Dynamic Snippet Generator Output View](Screenshots/Screenshot%202026-06-02%20164543.png)

---

### RTOS Architect Workspace

The RTOS Architect Workspace translates natural language descriptions into complete multi-file project structures.

#### Specification and Configuration Input Panel
Users describe expected system execution flow in natural language. Form selectors are available for target microcontrollers and RTOS targets, alongside toggles for timing diagrams, header inclusion, and detailed comment generation.

![RTOS Architect Project Setup Input](Screenshots/Screenshot%202026-06-02%20165127.png)

#### Multi-file Workspace Output View
The workspace output page renders `main.c`, `tasks.h`, and `config.h` in tab views. State indicators show active, complete, or idle files. It provides download buttons for single files and batch files.

![RTOS Architect Multi-File Workspace Outputs](Screenshots/Screenshot%202026-06-02%20165140.png)

---

## Microcontroller and Peripheral Support Matrix

The table below outlines peripheral compatibility across various supported microcontrollers within the FirmForge system.

| Microcontroller Unit | UART | SPI | I2C | ADC | DAC | GPIO | Timer/PWM | Interrupt | DMA | Watchdog |
|----------------------|------|-----|-----|-----|-----|------|-----------|-----------|-----|----------|
| STM32F103            | Yes  | Yes | Yes | Yes | Yes | Yes  | Yes       | Yes       | Yes | Yes      |
| STM32F4xx            | Yes  | Yes | Yes | Yes | Yes | Yes  | Yes       | Yes       | Yes | Yes      |
| STM32H7xx            | Yes  | Yes | Yes | Yes | Yes | Yes  | Yes       | Yes       | Yes | Yes      |
| ESP32                | Yes  | Yes | Yes | Yes | Yes | Yes  | Yes       | Yes       | Yes | Yes      |
| ESP8266              | Yes  | Yes | Yes | Yes | No  | Yes  | Yes       | Yes       | No  | Yes      |
| Arduino UNO          | Yes  | Yes | Yes | Yes | No  | Yes  | Yes       | Yes       | No  | Yes      |
| Arduino Mega         | Yes  | Yes | Yes | Yes | No  | Yes  | Yes       | Yes       | No  | Yes      |
| RP2040               | Yes  | Yes | Yes | Yes | No  | Yes  | Yes       | Yes       | Yes | Yes      |
| nRF52840             | Yes  | Yes | Yes | Yes | No  | Yes  | Yes       | Yes       | Yes | Yes      |

---

## Technical Stack

FirmForge utilizes modern web frameworks and styling engines to deliver a responsive, performant experience:

* **Framework**: Next.js 16.2.6 (App Router paradigm)
* **Runtime Environment**: React 19.2.4
* **Language**: TypeScript 5.0 (Strict compiler compliance)
* **Styling Engine**: Tailwind CSS 4.0
* **Component Primitives**: `@base-ui/react` (v1.5.0) mapping through Shadcn UI structures (v4.9.0)
* **Animation Library**: Framer Motion 12.40.0
* **Typography**: Syne (headings), DM Sans (body text), and JetBrains Mono (monospaced code and labels) loaded via Next.js Font Optimization
* **AI Core**: Google Gemini API (using the `@google/generative-ai` SDK and the `gemini-2.0-flash` model)

---

## API Reference

### POST /api/generate-snippet

Generates hardware initialization and driver routines based on configured parameters, outputting a chunk-by-chunk C code stream.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload Schema (JSON)
```json
{
  "mcu": "string",
  "peripheral": "string",
  "codeStyle": "string",
  "parameters": {
    "key": "string"
  }
}
```

*Fields Description:*
* `mcu`: Microcontroller identifier (e.g., `"STM32F4xx"`, `"ESP32"`, `"Arduino UNO (ATmega328P)"`).
* `peripheral`: Target hardware peripheral (e.g., `"UART"`, `"SPI"`, `"I2C"`, `"DMA"`).
* `codeStyle`: Driver integration style (e.g., `"HAL Library"`, `"Bare Metal (Registers)"`, `"Arduino IDE"`).
* `parameters`: Key-value map representing peripheral configuration configurations.

#### Request Example
```json
{
  "mcu": "STM32F4xx",
  "peripheral": "UART",
  "codeStyle": "HAL Library",
  "parameters": {
    "baudRate": "115200",
    "txPin": "PA9",
    "rxPin": "PA10",
    "dataBits": "8",
    "stopBits": "1",
    "parity": "None"
  }
}
```

#### Responses

##### Success (200 OK)
* **Content-Type**: `text/plain`
* **Cache-Control**: `no-cache`
* **Transfer-Encoding**: `chunked`
* **Body**: Streams raw, commented C code.

##### Error Responses
* **400 Bad Request**: Missing request payload fields.
  ```json
  { "error": "Missing required fields: mcu, peripheral, codeStyle, parameters" }
  ```
* **500 Internal Server Error**: Token configuration missing.
  ```json
  { "error": "GEMINI_API_KEY is not configured. Add it to .env.local" }
  ```
* **502 Bad Gateway**: Communication issue with the Gemini API.
  ```json
  { "error": "Gemini API error: [Error details]" }
  ```

---

### POST /api/generate-rtos

Generates a three-file RTOS workspace layout based on natural language inputs, outputting a single text stream containing standard file boundaries.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload Schema (JSON)
```json
{
  "prompt": "string",
  "mcu": "string",
  "rtos": "string",
  "options": {
    "includeSchedulingDiagram": "boolean",
    "includeHeaders": "boolean",
    "addDetailedComments": "boolean"
  }
}
```

*Fields Description:*
* `prompt`: Detailed description of the software behavior (minimum 10 characters).
* `mcu`: Microcontroller identifier.
* `rtos`: Target RTOS engine (e.g., `"FreeRTOS"`, `"Zephyr"`, `"Bare Metal (No RTOS)"`).
* `options.includeSchedulingDiagram`: Request a text-based ASCII timing/scheduling diagram.
* `options.includeHeaders`: Request standard imports and header references in source comments.
* `options.addDetailedComments`: Request line-by-line detailed inline documentation.

#### Request Example
```json
{
  "prompt": "Read DHT22 sensor data every 2s, apply moving average, write warning to GPIO if over 40C",
  "mcu": "ESP32",
  "rtos": "FreeRTOS",
  "options": {
    "includeSchedulingDiagram": true,
    "includeHeaders": true,
    "addDetailedComments": true
  }
}
```

#### Responses

##### Success (200 OK)
* **Content-Type**: `text/plain`
* **X-Content-Type-Options**: `nosniff`
* **Transfer-Encoding**: `chunked`
* **Body**: Streams the three files bounded by delimiters:
  ```text
  ===FILE:main.c===
  // main.c implementation code
  ===FILE:tasks.h===
  // tasks.h definitions code
  ===FILE:config.h===
  // config.h configuration macros
  ===END===
  ```

##### Error Responses
* **400 Bad Request**: Insufficient description length or missing parameters.
  ```json
  { "error": "Please describe your firmware behavior in more detail." }
  ```
* **400 Bad Request**: Missing MCU or RTOS indicators.
  ```json
  { "error": "MCU and RTOS are required." }
  ```
* **500 Internal Server Error**: Token configuration missing.
  ```json
  { "error": "GEMINI_API_KEY is not configured. Add it to .env.local" }
  ```
* **502 Bad Gateway**: Upstream remote API connection failed.
  ```json
  { "error": "Gemini API error: [Error details]" }
  ```

---

## Project Directory Structure

The structure of the codebase is outlined below, highlighting key routing and UI rendering directories:

```
src/
├── app/
│   ├── layout.tsx            # Application-wide shell, custom font styling, and structure
│   ├── page.tsx              # Public-facing product landing page and marketing details
│   ├── api/
│   │   ├── generate-snippet/ # Streaming endpoint for single-file peripheral files
│   │   │   └── route.ts
│   │   └── generate-rtos/    # Delimited streaming endpoint for multi-file RTOS workspaces
│   │       └── route.ts
│   ├── generate/             # Interactive generation workspace workspace
│   │   ├── layout.tsx        # Route metadata and SEO layouts for generate
│   │   └── page.tsx          # Workspace tabs orchestrator
│   └── docs/                 # Documentation directory outlining MCU matrices
│       └── page.tsx
├── components/
│   ├── navbar.tsx            # Navigational banner featuring backdrop filters and active path tracking
│   ├── footer.tsx            # Footer featuring detailed legal and technology stack markers
│   ├── code-block.tsx        # Monospaced code renderer, clipboard handlers, and typing cursors
│   ├── mcu-badge.tsx         # Graphic microcontroller pinout rendering
│   ├── snippet-generator.tsx # Parameters panels, validation states, and single-stream rendering
│   ├── rtos-architect.tsx    # Multi-file code generation layouts, regex parser, and active statuses
│   └── ui/                   # Modular base UI components configured for Shadcn elements
├── lib/
│   ├── constants.ts          # Static constants, support lists, and boilerplate setups
│   ├── types.ts              # Global TypeScript configurations and type guards
│   ├── peripheral-params.ts  # Validation parameters and schemas mapped per hardware interface
│   └── utils.ts              # Formatting utilities, including class list consolidation
```

---

## Design System Specifications

FirmForge uses a custom design system designed to replicate high-precision instrumentation dashboards:

* **Background (Base)**: `#0A0A0F` (near-black, blue-tinted)
* **Surface (Card/Dialog)**: `#12121A` (medium dark surface)
* **Border/Line**: `#1E1E2E` (deep grey border accent)
* **Primary Accent**: `#00D4FF` (oscilloscope neon cyan)
* **Secondary Accent**: `#7C3AED` (neon purple)
* **Indicator/Success**: `#00FF88` (digital green)
* **Text (Active)**: `#E8E8F0` (high contrast white-grey)
* **Text (Muted)**: `#6B6B8A` (low-contrast description grey)

---

## Setup and Installation

### Prerequisites
* **Node.js**: Version 20.x or higher
* **npm**: Version 10.x or higher

### Step-by-Step Installation

1. **Clone the Repository** and navigate to the project directory:
   ```bash
   git clone https://github.com/HackIndiaXYZ/vibe-coding-hackathon-2026-indias-largest-ai-web3-event-hackindia-noname.git
   cd vibe-coding-hackathon-2026-indias-largest-ai-web3-event-hackindia-noname
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file by copying the example file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and configure your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Local Development Server**:
   ```bash
   npm run dev
   ```
   The application will become accessible at [http://localhost:3000](http://localhost:3000).

5. **Build and Start Production Server**:
   ```bash
   npm run build
   npm run start
   ```

---

## Deployment and Serverless Configuration

FirmForge is optimized for serverless hosting on Vercel. Due to the high compute overhead and token length requirements associated with multi-file RTOS workspace synthesis, specific serverless function runtime timeouts have been configured to prevent premature execution termination.

### Serverless Functions Timeout Configuration

A `vercel.json` configuration file is established in the root directory to extend the default execution duration limit for the backend API endpoints:

```json
{
  "functions": {
    "src/app/api/generate-snippet/route.ts": {
      "maxDuration": 60
    },
    "src/app/api/generate-rtos/route.ts": {
      "maxDuration": 120
    }
  }
}
```

* **Snippet Generator Endpoint (`/api/generate-snippet`)**: Configured with a maximum duration of 60 seconds to support single-file peripheral driver assembly.
* **RTOS Architect Workspace Endpoint (`/api/generate-rtos`)**: Configured with a maximum duration of 120 seconds to allow the Google Gemini API enough time to stream three fully formed project files (`main.c`, `tasks.h`, `config.h`) without gateway interruption.

### Security Headers and Optimizations

In the `next.config.ts` configuration, global HTTP response security headers are enforced for API routes to protect client integrations, along with package import optimizations for animations:

* **X-Content-Type-Options: `nosniff`**: Prevents MIME-type sniffing by browsers, forcing them to adhere strictly to the declared content-type headers.
* **X-Frame-Options: `DENY`**: Protects the API endpoints from clickjacking attacks by ensuring the response content cannot be embedded inside external iframe components.
* **Framer Motion Optimization**: Package imports for `framer-motion` are optimized to reduce bundle sizes.

---

## Security and Rate Limiting

To maintain service stability, prevent excessive API token consumption, and mitigate Denial of Service (DoS) attempts, a high-performance in-memory rate limiting mechanism is implemented in `src/lib/rate-limit.ts`.

### Architecture and Design

* **Fixed-Window Design**: Requests are monitored on an IP-based key with a sliding/fixed 1-minute window reset strategy.
* **Limit Enforcements**: A maximum of 10 API generation requests is allowed per IP address every minute.
* **Automatic Garbage Collection**: An active background garbage collection interval runs every 5 minutes, automatically removing expired client IP records to ensure memory leaks do not occur.
* **IP Resolution**: The rate limiter attempts to resolve the client IP address using standard proxy headers:
  1. `x-forwarded-for` (primary proxy list header)
  2. `x-real-ip` (fallback direct proxy header)
  3. Defaulting to a localized fallback if no headers are provided.

### Rate Limiting Responses

When a client surpasses the threshold, the API routes reject the request with an HTTP status code `429 Too Many Requests`. The response includes metadata indicating when the window resets:

```json
{
  "error": "Rate limit exceeded. Try again in 45 seconds."
}
```

Additionally, a standard `Retry-After` header is included in the HTTP headers indicating the number of seconds to wait.

---

## HackIndia 2026 Team Attribution

Developed for **HackIndia 2026**—India's largest AI and Web3 Hackathon.

* **Team**: No_Name
* **Team Members**:
  - Chandan Sai Pavan Padala ([GitHub Profile](https://github.com/chandansaipavanpadala))
  - D Rushikesh ([GitHub Profile](https://github.com/rushikesh-D69))

---

## License

This project is licensed under the MIT License. Refer to the [LICENSE](./LICENSE) file for the full text.
