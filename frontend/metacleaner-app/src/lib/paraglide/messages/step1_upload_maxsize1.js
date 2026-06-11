/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Maxsize1Inputs */

const en_step1_upload_maxsize1 = /** @type {(inputs: Step1_Upload_Maxsize1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max 500 MB / file`)
};

const cs_step1_upload_maxsize1 = /** @type {(inputs: Step1_Upload_Maxsize1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max 500 MB / soubor`)
};

/**
* | output |
* | --- |
* | "Max 500 MB / file" |
*
* @param {Step1_Upload_Maxsize1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_maxsize1 = /** @type {((inputs?: Step1_Upload_Maxsize1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Maxsize1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_maxsize1(inputs)
	return cs_step1_upload_maxsize1(inputs)
});
export { step1_upload_maxsize1 as "step1.upload.maxSize" }