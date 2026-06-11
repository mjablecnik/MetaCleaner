/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_PhotosInputs */

const en_step1_upload_photos = /** @type {(inputs: Step1_Upload_PhotosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Photos`)
};

const cs_step1_upload_photos = /** @type {(inputs: Step1_Upload_PhotosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fotografie`)
};

/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Step1_Upload_PhotosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_photos = /** @type {((inputs?: Step1_Upload_PhotosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_PhotosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_photos(inputs)
	return cs_step1_upload_photos(inputs)
});
export { step1_upload_photos as "step1.upload.photos" }