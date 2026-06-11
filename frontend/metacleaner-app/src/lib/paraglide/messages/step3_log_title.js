/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Log_TitleInputs */

const en_step3_log_title = /** @type {(inputs: Step3_Log_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activity log`)
};

const cs_step3_log_title = /** @type {(inputs: Step3_Log_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Průběžný log`)
};

/**
* | output |
* | --- |
* | "Activity log" |
*
* @param {Step3_Log_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_title = /** @type {((inputs?: Step3_Log_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_log_title(inputs)
	return cs_step3_log_title(inputs)
});
export { step3_log_title as "step3.log.title" }