import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  name: string;
  phone: string;
  eventType: string;
  date: string;
  notes?: string;
  createdAt: string;
};

// Module-level in-memory store for demo purposes (no DB).
const bookings: Booking[] = [];

function makeId(): string {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `DS-${n}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Тело запроса должно быть JSON-объектом." },
        { status: 400 }
      );
    }

    const name: string = (body.name ?? "").toString().trim();
    const phone: string = (body.phone ?? "").toString().trim();
    const eventType: string = (body.eventType ?? "").toString().trim();
    const date: string = (body.date ?? "").toString().trim();
    const notes: string | undefined = body.notes
      ? body.notes.toString().trim()
      : undefined;

    if (!name) {
      return NextResponse.json(
        { error: "Поле «Имя» обязательно для заполнения." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Поле «Телефон» обязательно для заполнения." },
        { status: 400 }
      );
    }

    const booking: Booking = {
      id: makeId(),
      name,
      phone,
      eventType: eventType || "Не указан",
      date: date || "Не выбрана",
      notes,
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);

    // For demo only — log to console.
    console.log("[bookings] new booking:", booking);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message:
        "Заявка принята! Стилист перезвонит в течение часа и подберёт 2–3 идеальных образа под ваше событие.",
    });
  } catch (err) {
    console.error("[bookings] POST error:", err);
    return NextResponse.json(
      {
        error:
          "Не удалось сохранить заявку. Позвоните нам на +7 (960) 795 93 69 — оформим заявку по телефону.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ count: bookings.length });
}
