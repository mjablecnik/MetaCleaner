/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_TitleInputs */

const en_step5_metadata_title = /** @type {(inputs: Step5_Metadata_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata overview`)
};

const cs_step5_metadata_title = /** @type {(inputs: Step5_Metadata_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přehled metadat`)
};

/**
* | output |
* | --- |
* | "Metadata overview" |
*
* @param {Step5_Metadata_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_title = /** @type {((inputs?: Step5_Metadata_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_title(inputs)
	return cs_step5_metadata_title(inputs)
});
export { step5_metadata_title as "step5.metadata.title" }