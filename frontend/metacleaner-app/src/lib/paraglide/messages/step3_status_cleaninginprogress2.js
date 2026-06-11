/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Status_Cleaninginprogress2Inputs */

const en_step3_status_cleaninginprogress2 = /** @type {(inputs: Step3_Status_Cleaninginprogress2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata cleaning in progress`)
};

const cs_step3_status_cleaninginprogress2 = /** @type {(inputs: Step3_Status_Cleaninginprogress2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Probíhá čištění metadat`)
};

/**
* | output |
* | --- |
* | "Metadata cleaning in progress" |
*
* @param {Step3_Status_Cleaninginprogress2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_cleaninginprogress2 = /** @type {((inputs?: Step3_Status_Cleaninginprogress2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Cleaninginprogress2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_status_cleaninginprogress2(inputs)
	return cs_step3_status_cleaninginprogress2(inputs)
});
export { step3_status_cleaninginprogress2 as "step3.status.cleaningInProgress" }