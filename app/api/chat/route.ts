import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "La IA no está configurada", code: "AI_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensajes inválido" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    // Usamos stream:true con await: así los errores de autenticación o saldo
    // se lanzan AQUÍ (antes de enviar bytes) y podemos devolver un código claro.
    let stream;
    try {
      stream = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });
    } catch (err) {
      return mapAnthropicError(err);
    }

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

function mapAnthropicError(err: unknown) {
  const status = err instanceof Anthropic.APIError ? err.status : undefined;
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  console.error("Anthropic API error:", err);

  if (status === 400 && message.includes("credit")) {
    return NextResponse.json(
      { error: "Sin saldo de API", code: "AI_NO_CREDIT" },
      { status: 402 }
    );
  }
  if (status === 401) {
    return NextResponse.json(
      { error: "API key inválida", code: "AI_INVALID_KEY" },
      { status: 401 }
    );
  }
  if (status === 429) {
    return NextResponse.json(
      { error: "Límite de uso alcanzado", code: "AI_RATE_LIMIT" },
      { status: 429 }
    );
  }
  return NextResponse.json(
    { error: "Error al procesar la solicitud" },
    { status: 500 }
  );
}
