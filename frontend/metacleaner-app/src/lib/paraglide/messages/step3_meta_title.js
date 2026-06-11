/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Meta_TitleInputs */

const en_step3_meta_title = /** @type {(inputs: Step3_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Processing`)
};

const cs_step3_meta_title = /** @type {(inputs: Step3_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Zpracovávám`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Processing" |
*
* @param {Step3_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_meta_title = /** @type {((inputs?: Step3_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_meta_title(inputs)
	return cs_step3_meta_title(inputs)
});
export { step3_meta_title as "step3.meta.title" }