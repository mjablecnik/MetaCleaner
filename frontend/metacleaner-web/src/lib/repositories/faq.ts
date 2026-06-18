export interface FaqItem {
	id: string;
	questionKey: string;
	answerKey: string;
}

export function getFaq(): FaqItem[] {
	return [
		{ id: '1', questionKey: 'home_faq_1_question', answerKey: 'home_faq_1_answer' },
		{ id: '2', questionKey: 'home_faq_2_question', answerKey: 'home_faq_2_answer' },
		{ id: '3', questionKey: 'home_faq_3_question', answerKey: 'home_faq_3_answer' },
		{ id: '4', questionKey: 'home_faq_4_question', answerKey: 'home_faq_4_answer' },
		{ id: '5', questionKey: 'home_faq_5_question', answerKey: 'home_faq_5_answer' },
		{ id: '6', questionKey: 'home_faq_6_question', answerKey: 'home_faq_6_answer' },
		{ id: '7', questionKey: 'home_faq_7_question', answerKey: 'home_faq_7_answer' },
		{ id: '8', questionKey: 'home_faq_8_question', answerKey: 'home_faq_8_answer' }
	];
}
