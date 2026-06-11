/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Meta_TitleInputs */

const en_step4_meta_title = /** @type {(inputs: Step4_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Processing Error`)
};

const cs_step4_meta_title = /** @type {(inputs: Step4_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Chyba zpracování`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Processing Error" |
*
* @param {Step4_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_meta_title = /** @type {((inputs?: Step4_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_meta_title(inputs)
	return cs_step4_meta_title(inputs)
});
export { step4_meta_title as "step4.meta.title" }