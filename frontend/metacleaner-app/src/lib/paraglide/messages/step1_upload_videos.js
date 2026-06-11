/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_VideosInputs */

const en_step1_upload_videos = /** @type {(inputs: Step1_Upload_VideosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Videos`)
};

const cs_step1_upload_videos = /** @type {(inputs: Step1_Upload_VideosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Videa`)
};

/**
* | output |
* | --- |
* | "Videos" |
*
* @param {Step1_Upload_VideosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_videos = /** @type {((inputs?: Step1_Upload_VideosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_VideosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_videos(inputs)
	return cs_step1_upload_videos(inputs)
});
export { step1_upload_videos as "step1.upload.videos" }