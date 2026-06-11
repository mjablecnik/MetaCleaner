/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Meta_TitleInputs */

const en_step2_meta_title = /** @type {(inputs: Step2_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Files Loaded`)
};

const cs_step2_meta_title = /** @type {(inputs: Step2_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Soubory načteny`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Files Loaded" |
*
* @param {Step2_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_meta_title = /** @type {((inputs?: Step2_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_meta_title(inputs)
	return cs_step2_meta_title(inputs)
});
export { step2_meta_title as "step2.meta.title" }