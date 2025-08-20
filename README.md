# code.simd.ai README

Supercharge SIMD development directly in VS Code with AI-assisted code translation and optimization across multiple SIMD architectures.

AI-powered translation makes porting your code between SSE4.2, NEON, VSX, and more effortless. Enjoy smart intrinsics highlighting, instant conversions, and seamless workflow integration.

---

## Features

- **AI-assisted SIMD Code Porting**  
  Automatically translate SIMD code across architectures like SSE4.2, NEON, and VSX in real-time.  

  ```c
  // Original SSE4.2 Code
  __m128i a = _mm_loadu_si128(ptr_a);
  __m128i b = _mm_loadu_si128(ptr_b);
  __m128i result = _mm_add_epi32(a, b);

  // Converted to NEON
  int32x4_t a = vld1q_s32(ptr_a);
  int32x4_t b = vld1q_s32(ptr_b);
  int32x4_t result = vaddq_s32(a, b);
  ```

- **Smart Intrinsics Highlighting**  
  Easily read and navigate SIMD intrinsics with syntax highlighting tailored to each architecture.

- **AI Chat Sessions**  
  Engage with a specialized SIMD AI for explanations, optimizations, and architecture-specific guidance. Maintain multiple chat sessions across projects.  

- **Free & Premium Architectures**  
  - Free: SSE4.2, NEON, VSX  
  - Premium (requires SIMD.ai paid plan): AVX512, IBM-Z, RVV 1.0, LSX/LASX, MIPS/MSA, SVE, SVE2  

- **Lightning Fast Porting**  
  Optimize and port your SIMD code in seconds, saving hours of manual work.

- **Better Results**  
  Based on SIMD.info data for higher accuracy than generic LLMs, including ChatGPT or Claude.

---

## Requirements

- Visual Studio Code (latest stable version recommended)
- Internet connection for AI translation and chat features
- Optional: SIMD.ai account for premium architectures and AI translation

---

## Extension Settings

This extension contributes the following settings:

* `code.simd.ai.apiToken`: Your SIMD AI API token. Get it from [https://simd.ai/](https://simd.ai/).

---

## Known Issues

- Some architectures (e.g., RVV 1.0, LSX/LASX) are still in development.  

---

## Release Notes

### 0.0.1
- Initial release of **code.simd.ai** with AI-assisted SIMD code porting for SSE4.2, NEON, and VSX.
- Added AI chat sessions for code guidance  


### 0.0.2
- Fixes on Hover Tooltip


---

**Enjoy SIMD coding made easy! �**
