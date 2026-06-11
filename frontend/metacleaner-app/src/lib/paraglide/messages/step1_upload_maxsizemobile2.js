/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Maxsizemobile2Inputs */

const en_step1_upload_maxsizemobile2 = /** @type {(inputs: Step1_Upload_Maxsizemobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max 500 MB`)
};

const cs_step1_upload_maxsizemobile2 = /** @type {(inputs: Step1_Upload_Maxsizemobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max 500 MB`)
};

/**
* | output |
* | --- |
* | "Max 500 MB" |
*
* @param {Step1_Upload_Maxsizemobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_maxsizemobile2 = /** @type {((inputs?: Step1_Upload_Maxsizemobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Maxsizemobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_maxsizemobile2(inputs)
	return cs_step1_upload_maxsizemobile2(inputs)
});
export { step1_upload_maxsizemobile2 as "step1.upload.maxSizeMobile" }