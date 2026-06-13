import Header from "@/components/layout/Header";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="Chat IA"
        subtitle="Consulta dudas sobre molestias físicas, hábitos y ejercicios"
      />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
