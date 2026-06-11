/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Meta_TitleInputs */

const en_step1_meta_title = /** @type {(inputs: Step1_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Metadata Cleaning`)
};

const cs_step1_meta_title = /** @type {(inputs: Step1_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Čištění metadat`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Metadata Cleaning" |
*
* @param {Step1_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_meta_title = /** @type {((inputs?: Step1_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_meta_title(inputs)
	return cs_step1_meta_title(inputs)
});
export { step1_meta_title as "step1.meta.title" }