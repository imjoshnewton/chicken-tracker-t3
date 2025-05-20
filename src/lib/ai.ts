// Edge-compatible imports - dynamically imported for better compatibility
import type { OpenAI } from "langchain/llms/openai";
import type { PromptTemplate } from "langchain/prompts";
import type { Document } from "langchain/document";

const getPrompt = async (content: string) => {
  // Dynamically import to be Edge compatible
  const { PromptTemplate } = await import("langchain/prompts");
  
  const prompt = new PromptTemplate({
    template: "Analyze the following content and provide highlights of notable performance trends, such as highest production day or significant improvements: {entry}",
    inputVariables: ["entry"],
  });

  const input = await prompt.format({
    entry: content,
  });

  return input;
};

export const analyzeEntry = async (entry: {content: string}) => {
  const input = await getPrompt(entry.content);
  
  // Dynamically import OpenAI for Edge compatibility
  const { OpenAI } = await import("langchain/llms/openai");
  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const output = await model.invoke(input);

  return { performanceHighlights: output };
};

export const qa = async (question: any, entries: any) => {
  // Dynamic imports for Edge compatibility
  const { Document } = await import("langchain/document");
  const { OpenAI } = await import("langchain/llms/openai");
  const { OpenAIEmbeddings } = await import("langchain/embeddings/openai");
  const { MemoryVectorStore } = await import("langchain/vectorstores/memory");
  const { loadQARefineChain } = await import("langchain/chains");
  
  const docs = entries.map(
    (entry: any) =>
      new Document({
        pageContent: entry.content,
        metadata: { source: entry.id, date: entry.createdAt },
      }),
  );
  
  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const chain = loadQARefineChain(model);
  const embeddings = new OpenAIEmbeddings();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const relevantDocs = await store.similaritySearch(question);
  const res = await chain.invoke({
    input_documents: relevantDocs,
    question,
  });

  return res.output_text;
};
