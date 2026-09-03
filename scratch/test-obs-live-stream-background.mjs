import { parseYoutubeEmbedUrl } from '../src/lib/youtube.ts';

function runTests() {
  console.log("=== Testing YouTube URL Conversion ===");

  const testCases = [
    {
      input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      expected: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      desc: "Standard watch URL"
    },
    {
      input: "https://youtu.be/dQw4w9WgXcQ",
      expected: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      desc: "Shortened youtu.be URL"
    },
    {
      input: "https://www.youtube.com/live/dQw4w9WgXcQ?feature=share",
      expected: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      desc: "YouTube Live URL"
    },
    {
      input: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      expected: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      desc: "Already embedded URL (adds params)"
    },
    {
      input: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      expected: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1",
      desc: "Already correct URL"
    },
    {
      input: "https://twitch.tv/somechannel",
      expected: "https://twitch.tv/somechannel",
      desc: "Non-YouTube URL (should pass through)"
    }
  ];

  let passed = 0;
  testCases.forEach((tc, i) => {
    const result = parseYoutubeEmbedUrl(tc.input);
    if (result === tc.expected) {
      console.log(`[PASS] Test ${i + 1} (${tc.desc})`);
      passed++;
    } else {
      console.log(`[FAIL] Test ${i + 1} (${tc.desc})`);
      console.log(`       Input:    ${tc.input}`);
      console.log(`       Expected: ${tc.expected}`);
      console.log(`       Got:      ${result}`);
    }
  });

  console.log(`\nResults: ${passed}/${testCases.length} tests passed.`);
  
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

runTests();
