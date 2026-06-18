export interface FaqItem {
	id: string;
	questionKey: string;
	answerKey: string;
}

export function getFaq(layout?: 'desktop' | 'mobile'): FaqItem[] {
	if (layout === 'mobile') {
		return [
			{ id: 'm1', questionKey: 'home_faq_m1_question', answerKey: 'home_faq_m1_answer' },
			{ id: 'm2', questionKey: 'home_faq_m2_question', answerKey: 'home_faq_m2_answer' },
			{ id: 'm3', questionKey: 'home_faq_m3_question', answerKey: 'home_faq_m3_answer' },
			{ id: 'm4', questionKey: 'home_faq_m4_question', answerKey: 'home_faq_m4_answer' },
			{ id: 'm5', questionKey: 'home_faq_m5_question', answerKey: 'home_faq_m5_answer' }
		];
	}

	return [
		{ id: 'd1', questionKey: 'home_faq_d1_question', answerKey: 'home_faq_d1_answer' },
		{ id: 'd2', questionKey: 'home_faq_d2_question', answerKey: 'home_faq_d2_answer' },
		{ id: 'd3', questionKey: 'home_faq_d3_question', answerKey: 'home_faq_d3_answer' },
		{ id: 'd4', questionKey: 'home_faq_d4_question', answerKey: 'home_faq_d4_answer' },
		{ id: 'd5', questionKey: 'home_faq_d5_question', answerKey: 'home_faq_d5_answer' }
	];
}
