import Header from "@/components/layout/Header";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Chat IA"
        subtitle="Consulta dudas sobre molestias físicas, hábitos y ejercicios"
      />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
