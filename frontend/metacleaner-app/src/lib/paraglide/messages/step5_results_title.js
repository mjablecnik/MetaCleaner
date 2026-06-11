/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Results_TitleInputs */

const en_step5_results_title = /** @type {(inputs: Step5_Results_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File results`)
};

const cs_step5_results_title = /** @type {(inputs: Step5_Results_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Výsledky souborů`)
};

/**
* | output |
* | --- |
* | "File results" |
*
* @param {Step5_Results_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_title = /** @type {((inputs?: Step5_Results_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_results_title(inputs)
	return cs_step5_results_title(inputs)
});
export { step5_results_title as "step5.results.title" }