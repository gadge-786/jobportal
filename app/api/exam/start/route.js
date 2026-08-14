import supabaseAdmin from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const examId = searchParams.get('examId')

  if (!examId) {
    return NextResponse.json({ error: 'Missing examId' }, { status: 400 })
  }

  const { data: exam, error: examError } = await supabaseAdmin
    .from('exam_tests')
    .select('*')
    .eq('id', examId)
    .eq('is_active', true)
    .single()

  if (examError || !exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  let sections = []
  if (exam.has_sections) {
    const { data } = await supabaseAdmin
      .from('exam_sections')
      .select('*')
      .eq('exam_id', examId)
      .order('section_order', { ascending: true })
    sections = data || []
  }

  const { data: questions, error: qError } = await supabaseAdmin
    .from('exam_questions')
    .select('id, exam_id, section_id, question_order, question_text, option_a, option_b, option_c, option_d, marks')
    .eq('exam_id', examId)
    .order('question_order', { ascending: true })

  if (qError) {
    return NextResponse.json({ error: 'Could not load questions' }, { status: 500 })
  }

  return NextResponse.json({
    exam,
    sections,
    questions
  })
}