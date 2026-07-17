// ============================================================
// Infinitra Build — Challenge Question Bank
// ============================================================
// Edit this file to add/remove/rotate questions.
// Each slot has multiple variants. Candidates get a seeded-random
// combination based on their email, so:
// - Same person always sees the same questions (no refresh gaming)
// - Different people see different combinations
// - You can add variants anytime without code changes
//
// FORMAT:
// Each slot has: id, title (shown to candidate), timeHint, variants[]
// Each variant has: id (for tracking), prompt (the question text)
// ============================================================

const QUESTIONS = {
  slots: [
    {
      id: "research",
      title: "Research & Find",
      timeHint: "~5 minutes",
      instruction: "Use Google, AI, or any tool. We care about what you find and how you judge it.",
      variants: [
        {
          id: "r1",
          prompt: "Find 2 real examples of AI being used in Indian hospitals right now (2026 — not future plans). For each, name the hospital or company and write 1 sentence about what the AI actually does."
        },
        {
          id: "r2",
          prompt: "Find 2 real examples of AI being used in Indian schools or education right now (2026). For each, name the school or company and write 1 sentence about what the AI actually does."
        },
        {
          id: "r3",
          prompt: "Find 2 real examples of AI being used in Indian agriculture or farming right now (2026). For each, name the company or initiative and write 1 sentence about what the AI actually does."
        },
        {
          id: "r4",
          prompt: "Find 2 real examples of AI being used in Indian banks or financial services right now (2026). For each, name the bank or company and write 1 sentence about what the AI actually does."
        }
      ]
    },
    {
      id: "problem",
      title: "Solve a Problem",
      timeHint: "~5 minutes",
      instruction: "There's no perfect answer. We want to see how you think about real problems for real people.",
      variants: [
        {
          id: "p1",
          prompt: "A grocery shop owner in Kurnool orders stock by gut feeling. Sometimes items run out (lost sales), sometimes they expire (wasted money). He has no computer — just a phone with WhatsApp. Describe a simple system to help him order better. 3-4 sentences."
        },
        {
          id: "p2",
          prompt: "A small clinic in Kurnool has 2 doctors and 40 patients/day. Patients wait 2+ hours because there's no appointment system — everyone just shows up in the morning. The clinic only has a phone and a paper register. Describe a simple system to reduce waiting time. 3-4 sentences."
        },
        {
          id: "p3",
          prompt: "A delivery person in Kurnool covers 30 deliveries a day on a bike. He often visits wrong addresses or misses time windows because he gets orders via WhatsApp messages that pile up. Describe a simple system to help him organize his day. 3-4 sentences."
        },
        {
          id: "p4",
          prompt: "A tuition teacher has 60 students across 4 batches. She can never remember who paid fees, who's absent often, or who's falling behind. She uses a notebook that's getting messy. Describe a simple system using only her phone. 3-4 sentences."
        }
      ]
    },
    {
      id: "judgment",
      title: "Make a Call",
      timeHint: "~5 minutes",
      instruction: "There's conflicting advice below. We want to see how you prioritize and reason.",
      variants: [
        {
          id: "j1",
          prompt: "Your friend wants to sell homemade pickles online. Four people give conflicting advice:\n\nA: \"Build an Instagram following first, then sell.\"\nB: \"List on Amazon immediately. That's where buyers are.\"\nC: \"Go to local shops. Online shipping eats your margins.\"\nD: \"Get FSSAI license first. Selling food without it is illegal.\"\n\nShe can make 20 jars/week with zero marketing budget. What should she do FIRST, and why? 3-4 sentences."
        },
        {
          id: "j2",
          prompt: "Your friend wants to start a YouTube channel teaching spoken English. Four people give conflicting advice:\n\nA: \"Buy a good camera and mic first. Quality matters.\"\nB: \"Just start with your phone. Consistency beats quality.\"\nC: \"Don't do YouTube — teach on Zoom instead. Direct money.\"\nD: \"Study what other English channels do for 3 months first.\"\n\nHe has ₹5,000 to invest and 2 free hours/day. What should he do FIRST, and why? 3-4 sentences."
        },
        {
          id: "j3",
          prompt: "Your friend wants to start a tiffin delivery service for office workers. Four people give conflicting advice:\n\nA: \"Start a WhatsApp group, take orders there.\"\nB: \"Build an app first. That's how food delivery works.\"\nC: \"Partner with Swiggy/Zomato. They have the customers.\"\nD: \"Start with just 5 customers near you. Grow by word of mouth.\"\n\nShe cooks well, has a bike, and can make 20 meals/day max. What should she do FIRST, and why? 3-4 sentences."
        },
        {
          id: "j4",
          prompt: "Your friend finished a diploma and wants to get into tech. Four people give conflicting advice:\n\nA: \"Do a 6-month Java course at an institute.\"\nB: \"Learn Python from YouTube for free.\"\nC: \"Forget coding — learn digital marketing instead.\"\nD: \"Get any IT job first, even data entry. Learn on the job.\"\n\nHe has no coding experience, lives in Kurnool, and needs to earn within 6 months. What should he do FIRST, and why? 3-4 sentences."
        }
      ]
    },
    {
      id: "apply",
      title: "Use a Tool",
      timeHint: "~5 minutes",
      instruction: "Actually do this right now. Use any AI tool (ChatGPT, Google Gemini, Claude — whatever you have access to).",
      variants: [
        {
          id: "a1",
          prompt: "Open any AI tool. Ask it: \"What is an API? Explain like I'm 15.\" Read the answer. Now, in your own words, explain what you understood — as if explaining to a friend. Then: what did the AI's explanation miss or get wrong?"
        },
        {
          id: "a2",
          prompt: "Open any AI tool. Ask it: \"What does a software developer actually do all day?\" Read the answer. Now: what surprised you? What sounds boring? What sounds exciting? Write in your own words — not what the AI said."
        },
        {
          id: "a3",
          prompt: "Open any AI tool. Ask it: \"How does Netflix decide what to recommend to each person?\" Read the answer. Now explain it in 3-4 simple sentences as if telling your mother. What part was hardest to understand?"
        },
        {
          id: "a4",
          prompt: "Open any AI tool. Ask it: \"How do UPI payments work behind the scenes?\" Read the answer. Now explain the basic idea in 3-4 sentences using a simple analogy (like comparing it to something from daily life). What did you find surprising?"
        }
      ]
    }
  ]
};

// ============================================================
// Seeded random - picks variants based on candidate identifier
// ============================================================
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function getQuestionsForCandidate(identifier) {
  const hash = hashString(identifier.toLowerCase().trim());
  return QUESTIONS.slots.map((slot, index) => {
    const variantIndex = (hash + index * 7) % slot.variants.length;
    return {
      slotId: slot.id,
      title: slot.title,
      timeHint: slot.timeHint,
      instruction: slot.instruction,
      variantId: slot.variants[variantIndex].id,
      prompt: slot.variants[variantIndex].prompt
    };
  });
}
