import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres un asistente especializado en prevención de lesiones para trabajadores de oficina sedentarios. Tu nombre es "prev.ai".

Tu rol:
- Ayudar a oficinistas a prevenir lesiones musculoesqueléticas
- Dar consejos sobre ergonomía, postura y hábitos saludables
- Sugerir ejercicios específicos para el trabajo de oficina
- Orientar sobre pausas activas y rutinas de movilidad
- Explicar síntomas comunes y cuándo acudir a un médico

Áreas de expertise:
- Dolor de cuello, espalda, muñecas, hombros
- Síndrome del túnel carpiano
- Lumbalgia por sedentarismo
- Ergonomía de estación de trabajo
- Ejercicios de movilidad y flexibilidad
- Técnicas de relajación muscular
- Hábitos de hidratación y descanso

Estilo de respuesta:
- Responde siempre en español
- Sé empático, claro y práctico
- Da pasos concretos y accionables
- Usa viñetas o listas cuando sea útil
- Siempre menciona cuándo es necesario consultar un médico
- Mantén respuestas concisas pero completas (máximo 300 palabras)
- Incluye ejercicios específicos cuando sea apropiado

IMPORTANTE: No reemplazas a un profesional de salud. Siempre recuerda al usuario consultar con un médico o fisioterapeuta ante dudas serias o dolor persistente.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensajes inválido" }, { status: 400 });
    }

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
