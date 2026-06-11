/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Meta_TitleInputs */

const en_step5_meta_title = /** @type {(inputs: Step5_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Cleaning Complete`)
};

const cs_step5_meta_title = /** @type {(inputs: Step5_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Čištění dokončeno`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Cleaning Complete" |
*
* @param {Step5_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_meta_title = /** @type {((inputs?: Step5_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_meta_title(inputs)
	return cs_step5_meta_title(inputs)
});
export { step5_meta_title as "step5.meta.title" }