/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Step3_Progress_Filescompleted1Inputs */

const en_step3_progress_filescompleted1 = /** @type {(inputs: Step3_Progress_Filescompleted1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} of ${i?.total} files completed`)
};

const cs_step3_progress_filescompleted1 = /** @type {(inputs: Step3_Progress_Filescompleted1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} z ${i?.total} souborů dokončeno`)
};

/**
* | output |
* | --- |
* | "{done} of {total} files completed" |
*
* @param {Step3_Progress_Filescompleted1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_filescompleted1 = /** @type {((inputs: Step3_Progress_Filescompleted1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_Filescompleted1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_progress_filescompleted1(inputs)
	return cs_step3_progress_filescompleted1(inputs)
});
export { step3_progress_filescompleted1 as "step3.progress.filesCompleted" }