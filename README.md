# code.simd.ai README

Supercharge SIMD development directly in VS Code.

AI-assisted SIMD code porting across SSE4.2, AVX, NEON, VSX, and more—right inside your editor. Smart intrinsics highlighting, instant conversions, and seamless dev workflow integration.

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

<video id="demo-video" class="demo-video" autoplay="" muted="" loop="" playsinline="" preload="auto" disablepictureinpicture="" controlslist="nodownload nofullscreen noremoteplayback" src="https://code.simd.ai/images/vids/highlighting_2.mp4">
    <source src="https://code.simd.ai/images/videos/chatting_trimmed_final.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>

- **AI Chat Sessions**  
  Engage with a specialized SIMD AI for explanations, optimizations, and architecture-specific guidance. Maintain multiple chat sessions across projects.  

<video id="demo-video" class="demo-video" autoplay="" muted="" loop="" playsinline="" preload="auto" disablepictureinpicture="" controlslist="nodownload nofullscreen noremoteplayback" src="https://code.simd.ai/images/vids/ai_chat.mp4">
    <source src="https://code.simd.ai/images/videos/chatting_trimmed_final.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>

- **Free & Premium Architectures**  
  - Free: SSE4.2, NEON, VSX  
  - Premium (requires SIMD.ai paid plan): AVX512, IBM-Z, RVV 1.0, LSX/LASX, MIPS/MSA, SVE, SVE2  

- **Lightning Fast Porting**  
  Port your SIMD code in seconds, saving hours of manual work.

<video id="demo-video" class="demo-video" autoplay="" muted="" loop="" playsinline="" preload="auto" disablepictureinpicture="" controlslist="nodownload nofullscreen noremoteplayback" src="https://code.simd.ai/images/vids/full_translation.mp4">
    <source src="https://code.simd.ai/images/videos/chatting_trimmed_final.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>


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

## Coming soon

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
