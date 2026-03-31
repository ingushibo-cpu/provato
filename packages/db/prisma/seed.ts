import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.skillVerification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.talentProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  // ─── Skills ──────────────────────────────────────────

  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        name: "RAG Architecture",
        category: "RAG",
        description:
          "Design and implement Retrieval-Augmented Generation pipelines with vector databases, chunking strategies, and hybrid search.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "LLM Fine-Tuning",
        category: "FINE_TUNING",
        description:
          "Fine-tune foundation models using LoRA, QLoRA, and full fine-tuning with custom datasets and evaluation metrics.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "Prompt Engineering",
        category: "PROMPT_ENGINEERING",
        description:
          "Design system prompts, few-shot examples, chain-of-thought reasoning, and evaluation frameworks for LLM applications.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "ML Pipeline Engineering",
        category: "ML_ENGINEERING",
        description:
          "Build production ML pipelines with feature stores, model registries, A/B testing, and monitoring infrastructure.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "AI Safety & Ethics",
        category: "AI_ETHICS",
        description:
          "Implement guardrails, content filtering, bias detection, and responsible AI practices in production systems.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "LLMOps & Deployment",
        category: "LLM_OPS",
        description:
          "Deploy and manage LLM infrastructure including model serving, caching, rate limiting, and cost optimization.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "Multimodal AI",
        category: "MULTIMODAL",
        description:
          "Build applications combining vision, text, and audio models for complex multimodal workflows.",
      },
    }),
    prisma.skill.create({
      data: {
        name: "Vector Database Design",
        category: "RAG",
        description:
          "Design and optimize vector storage solutions using pgvector, Pinecone, Weaviate, or Qdrant for semantic search.",
      },
    }),
  ]);

  // ─── Talent Users ────────────────────────────────────

  const talents = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: "clerk_talent_001",
        email: "elena.vasquez@example.com",
        name: "Elena Vasquez",
        role: "TALENT",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_talent_002",
        email: "james.chen@example.com",
        name: "James Chen",
        role: "TALENT",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_talent_003",
        email: "priya.sharma@example.com",
        name: "Priya Sharma",
        role: "TALENT",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_talent_004",
        email: "marcus.johnson@example.com",
        name: "Marcus Johnson",
        role: "TALENT",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_talent_005",
        email: "sarah.mueller@example.com",
        name: "Sarah Mueller",
        role: "TALENT",
      },
    }),
  ]);

  // ─── Talent Profiles ─────────────────────────────────

  const profiles = await Promise.all([
    prisma.talentProfile.create({
      data: {
        userId: talents[0]!.id,
        bio: "Senior ML Engineer with 8 years of experience building RAG systems and search infrastructure at scale. Previously at Google and Anthropic. Specialized in production-grade retrieval pipelines handling millions of documents.",
        hourlyRate: 250,
        availability: "20 hrs/week",
        location: "San Francisco, CA",
        languages: ["English", "Spanish"],
        portfolioUrl: "https://elenavasquez.dev",
        overallScore: 4.8,
        totalProjects: 23,
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talents[1]!.id,
        bio: "Full-stack AI engineer specializing in LLM fine-tuning and deployment. Built fine-tuning infrastructure at OpenAI. Expert in LoRA, QLoRA, and RLHF techniques with proven track record of reducing inference costs by 60%.",
        hourlyRate: 300,
        availability: "Full-time",
        location: "New York, NY",
        languages: ["English", "Mandarin"],
        portfolioUrl: "https://jameschen.ai",
        overallScore: 4.9,
        totalProjects: 31,
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talents[2]!.id,
        bio: "AI Safety researcher and practitioner with deep expertise in responsible AI deployment. Former DeepMind researcher. Published 12 papers on AI safety evaluation frameworks. Specializes in red-teaming and guardrail design.",
        hourlyRate: 275,
        availability: "30 hrs/week",
        location: "London, UK",
        languages: ["English", "Hindi", "Gujarati"],
        portfolioUrl: "https://priyasharma.research",
        overallScore: 4.7,
        totalProjects: 15,
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talents[3]!.id,
        bio: "LLMOps specialist and infrastructure architect. Designed GPU serving infrastructure handling 10M+ requests/day at Databricks. Expert in model quantization, vLLM, and cost-optimized inference orchestration.",
        hourlyRate: 280,
        availability: "Full-time",
        location: "Austin, TX",
        languages: ["English"],
        portfolioUrl: "https://marcusjohnson.tech",
        overallScore: 4.6,
        totalProjects: 19,
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talents[4]!.id,
        bio: "Multimodal AI expert with background in computer vision and NLP. Built vision-language pipelines at Tesla and Hugging Face. Specializes in document understanding, chart reasoning, and video analysis systems.",
        hourlyRate: 260,
        availability: "20 hrs/week",
        location: "Berlin, Germany",
        languages: ["English", "German", "French"],
        portfolioUrl: "https://sarahmueller.ai",
        overallScore: 4.5,
        totalProjects: 12,
      },
    }),
  ]);

  // ─── Skill Verifications ─────────────────────────────

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const verifications = [
    { talentIdx: 0, skillIdx: 0, score: 95 },
    { talentIdx: 0, skillIdx: 7, score: 92 },
    { talentIdx: 0, skillIdx: 2, score: 88 },
    { talentIdx: 1, skillIdx: 1, score: 97 },
    { talentIdx: 1, skillIdx: 3, score: 91 },
    { talentIdx: 1, skillIdx: 5, score: 89 },
    { talentIdx: 2, skillIdx: 4, score: 96 },
    { talentIdx: 2, skillIdx: 2, score: 90 },
    { talentIdx: 3, skillIdx: 5, score: 94 },
    { talentIdx: 3, skillIdx: 3, score: 88 },
    { talentIdx: 3, skillIdx: 1, score: 82 },
    { talentIdx: 4, skillIdx: 6, score: 93 },
    { talentIdx: 4, skillIdx: 0, score: 85 },
  ];

  for (const v of verifications) {
    await prisma.skillVerification.create({
      data: {
        talentId: profiles[v.talentIdx]!.id,
        skillId: skills[v.skillIdx]!.id,
        score: v.score,
        challengeText: `Technical challenge: Design and implement a production-grade solution in the assessed skill area. Include architecture decisions, trade-offs, and performance benchmarks.`,
        responseText: `Comprehensive solution submitted with full implementation, architecture diagrams, and benchmarked results demonstrating ${v.score}% mastery.`,
        evaluationNotes: `Exceptional technical depth. Score: ${v.score}/100. Verified by Provato assessment engine.`,
        expiresAt,
      },
    });
  }

  // ─── Client Users ────────────────────────────────────

  const clients = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: "clerk_client_001",
        email: "alex.thompson@techcorp.com",
        name: "Alex Thompson",
        role: "CLIENT",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_client_002",
        email: "lisa.park@aiventures.com",
        name: "Lisa Park",
        role: "CLIENT",
      },
    }),
  ]);

  // ─── Projects ────────────────────────────────────────

  await Promise.all([
    prisma.project.create({
      data: {
        clientId: clients[0]!.id,
        title: "Enterprise RAG System for Legal Document Search",
        description:
          "Build a production RAG pipeline for searching and analyzing 2M+ legal documents. Requires hybrid search (semantic + keyword), multi-tenant isolation, and sub-200ms P95 latency. Must integrate with an existing Elasticsearch cluster and support incremental indexing.",
        budget: 45000,
        timeline: "8 weeks",
        requiredSkills: [
          "RAG Architecture",
          "Vector Database Design",
          "LLMOps & Deployment",
        ],
        status: "OPEN",
      },
    }),
    prisma.project.create({
      data: {
        clientId: clients[0]!.id,
        title: "Fine-Tune LLM for Medical Report Summarization",
        description:
          "Fine-tune a foundation model to accurately summarize radiology reports while preserving critical findings. Dataset of 50K annotated reports available. Must achieve >95% accuracy on key finding extraction with HIPAA-compliant infrastructure.",
        budget: 35000,
        timeline: "6 weeks",
        requiredSkills: [
          "LLM Fine-Tuning",
          "AI Safety & Ethics",
          "ML Pipeline Engineering",
        ],
        status: "OPEN",
      },
    }),
    prisma.project.create({
      data: {
        clientId: clients[1]!.id,
        title: "Multimodal Customer Support Agent",
        description:
          "Design and deploy a multimodal AI agent that handles customer support via text, images, and screenshots. Must understand product images, parse error screenshots, and provide contextual troubleshooting. Zendesk + Slack integration required.",
        budget: 28000,
        timeline: "10 weeks",
        requiredSkills: [
          "Multimodal AI",
          "Prompt Engineering",
          "RAG Architecture",
        ],
        status: "OPEN",
      },
    }),
  ]);

  // ─── Admin ────────────────────────────────────────────

  await prisma.user.create({
    data: {
      clerkId: "clerk_admin_001",
      email: "admin@provato.ai",
      name: "Provato Admin",
      role: "ADMIN",
    },
  });

  console.log("✅ Seed complete!");
  console.log("   • 8 skills across all categories");
  console.log("   • 5 verified talent profiles");
  console.log("   • 13 skill verifications");
  console.log("   • 2 client users");
  console.log("   • 3 open projects");
  console.log("   • 1 admin user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
