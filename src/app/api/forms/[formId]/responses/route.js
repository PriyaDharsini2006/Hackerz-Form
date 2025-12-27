import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request, { params }) {
  try {
    const { formId } = await params;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: { orderBy: { order: "asc" } },
        responses: {
          include: { answers: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const searchParams = new URL(request.url).searchParams;
    const format = searchParams.get("format");

       if (format === "excel") {
      const headers = [
        "Email",
        "Submitted At",
        ...form.questions.map((q) => q.title),
      ];

      const rows = form.responses.map((response) => [
        response.email,
        response.createdAt.toISOString(),
        ...form.questions.map((question) => {
          const answer = response.answers.find(
            (a) => a.questionId === question.id
          );
          return answer?.value || "";
        }),
      ]);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = headers.map(() => ({ wch: 20 }));

      XLSX.utils.book_append_sheet(wb, ws, "Responses");

      const buffer = XLSX.write(wb, {
        type: "buffer",
        bookType: "xlsx",
      });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="responses.xlsx"`,
        },
      });
    }

    return NextResponse.json(form.responses);
  } catch (error) {
    console.error("GET responses error:", error);
    return NextResponse.json(
      { error: "Error fetching responses" },
      { status: 500 }
    );
  }
}
export async function POST(request, { params }) {
  try {
    const { formId } = await params;
    const { email, answers } = await request.json();

    const response = await prisma.response.create({
      data: {
        formId,
        email,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: { answers: true },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST response error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already submitted this form" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error submitting response" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { formId } = await  params;
    const { email, answers } = await request.json();
    const existingResponse = await prisma.response.findUnique({
      where: {
        formId_email: { formId, email },
      },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "No existing response found" },
        { status: 404 }
      );
    }

  
    const [, updatedResponse] = await prisma.$transaction([
      prisma.answer.deleteMany({
        where: { responseId: existingResponse.id },
      }),
      prisma.response.update({
        where: { id: existingResponse.id },
        data: {
          answers: {
            create: answers.map((a) => ({
              questionId: a.questionId,
              value: a.value,
            })),
          },
        },
        include: {
          answers: { include: { question: true } },
        },
      }),
    ]);

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("PUT response error:", error);
    return NextResponse.json(
      { error: "Error updating response" },
      { status: 500 }
    );
  }
}

