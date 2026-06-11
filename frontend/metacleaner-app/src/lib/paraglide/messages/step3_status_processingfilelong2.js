/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown> }} Step3_Status_Processingfilelong2Inputs */

const en_step3_status_processingfilelong2 = /** @type {(inputs: Step3_Status_Processingfilelong2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Processing file ${i?.filename}`)
};

const cs_step3_status_processingfilelong2 = /** @type {(inputs: Step3_Status_Processingfilelong2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Zpracovávám soubor ${i?.filename}`)
};

/**
* | output |
* | --- |
* | "Processing file {filename}" |
*
* @param {Step3_Status_Processingfilelong2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_processingfilelong2 = /** @type {((inputs: Step3_Status_Processingfilelong2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Processingfilelong2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_status_processingfilelong2(inputs)
	return cs_step3_status_processingfilelong2(inputs)
});
export { step3_status_processingfilelong2 as "step3.status.processingFileLong" }