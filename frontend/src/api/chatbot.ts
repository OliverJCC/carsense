import api from "./http";
export async function askChatbot(text:string){
  const { data } = await api.post("/chatbot/query", { text });
  return data as { intent:string; steps:string[] };
}
