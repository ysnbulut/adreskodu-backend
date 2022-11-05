require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const NodeCache = require('node-cache');
const Hashids = require('hashids');
const hashids = new Hashids('U4NgAx3ukr1y', 12);
class nviClass {
	constructor() {
		this.nviCache = new NodeCache({ stdTTL: 180, checkperiod: 200, deleteOnExpire: true });
		this.jar = new CookieJar();
		this.axiosConfig = {
			jar: this.jar,
			baseURL: 'https://adres.nvi.gov.tr/',
			withCredentials: true,
			headers: {
				Accept: '*/*',
				'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
				Host: 'adres.nvi.gov.tr',
				Origin: 'https://adres.nvi.gov.tr',
				Referer: 'https://adres.nvi.gov.tr/AdresSorgu',
				Connection: 'keep-alive',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36',
				'X-Requested-With': 'XMLHttpRequest',
			},
		};
		this.client = wrapper(axios.create(this.axiosConfig));
		this.getToken();
	}

	firstLetterToUpperCase(str) {
		const arr = str.toLowerCase().split(' ');
		for (var i = 0; i < arr.length; i++) {
			arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
		}
		return arr.join(' ');
	}

	async getToken() {
		const { data, config } = await this.client.get('Home');
		const cookieJar = config.jar.toJSON();
		const ch = cheerio.load(data);
		this.nviCache.set('token', ch('input[name=__RequestVerificationToken]').val());
		this.nviCache.set('cookies', cookieJar.cookies);
		this.axiosConfig.headers.__RequestVerificationToken = this.nviCache.get('token');
		this.client = wrapper(axios.create(this.axiosConfig));
	}

	async getProvinces() {
		const nvi = await this.client.post('Harita/ilListesi', {
			withCredentials: true,
			headers: {
				__RequestVerificationToken: this.nviCache.get('token'),
			},
		});
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((province) => {
			return {
				label: province.adi.toUpperCase(),
				value: hashids.encode(`${province.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return response;
	}

	async getDistricts(province_id) {
		const nvi = await this.client.post(
			'Harita/ilceListesi',
			{
				ilKimlikNo: province_id,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((district) => {
			return {
				label: this.firstLetterToUpperCase(district.adi),
				value: hashids.encode(`${district.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return response;
	}

	async getNeighborhoods(district_id) {
		const nvi = await this.client.post(
			'Harita/mahalleKoyBaglisiListesi',
			{
				ilceKimlikNo: district_id,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((neighborhood) => {
			return {
				label: this.firstLetterToUpperCase(neighborhood.bilesenAdi),
				value: hashids.encode(`${neighborhood.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return response;
	}

	async getStreets(neighborhood_id) {
		const nvi = await this.client.post(
			'Harita/yolListesi',
			{
				mahalleKoyBaglisiKimlikNo: neighborhood_id,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((street) => {
			let type = '';
			switch (street.turKod) {
				case 1:
					type = 'Meydanı';
					break;
				case 2:
					type = 'Bulvarı';
					break;
				case 3:
					type = 'Caddesi';
					break;
				case 4:
					type = 'Sokak';
					break;
				case 5:
					type = 'Küme Evler';
					break;

				default:
					type = '';
					break;
			}
			return {
				label: `${this.firstLetterToUpperCase(street.adi)} ${type}`,
				value: hashids.encode(`${street.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return response;
	}

	async getBuildings(neighborhood_id, street_id) {
		const nvi = await this.client.post(
			'Harita/binaListesi',
			{
				mahalleKoyBaglisiKimlikNo: neighborhood_id,
				yolKimlikNo: street_id,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((building) => {
			let building_label = '';
			if (building.adi !== null) {
				building_label = `No: ${building.disKapiNoFormatted.replace(/^\s+|\s+$|-/gm, '')} ${this.firstLetterToUpperCase(
					building.adi
				)}`;
			} else {
				building_label = `No: ${building.disKapiNoFormatted.replace(/^\s+|\s+$|-/gm, '')}`;
			}
			return {
				label: building_label,
				value: hashids.encode(`${building.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return {
			success: true,
			data: response,
		};
	}

	async getDoorNumbers(neighborhood_id, building_id) {
		const nvi = await this.client.post(
			'Harita/bagimsizBolumListesi',
			{
				mahalleKoyBaglisiKimlikNo: neighborhood_id,
				binaKimlikNo: building_id,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		const response = nvi.data.map((door) => {
			let door_label = true;
			if (door.katNo !== null && door.katNo !== '0') {
				door_label = `Kat: ${door.katNo}`;
			}
			if (door.icKapiNo !== null) {
				if (door_label !== '') {
					door_label = `Daire: ${door.icKapiNo}`;
				} else {
					door_label += ` Daire: ${door.icKapiNo}`;
				}
			}
			return {
				label: door_label,
				value: hashids.encode(`${door.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
			};
		});
		return {
			success: true,
			data: response,
		};
	}

	async getFullAddress(registration_number, addres_code) {
		const nvi = await this.client.post(
			'Harita/AcikAdres',
			{
				bagimsizBolumKayitNo: registration_number,
				bagimsizBolumAdresNo: addres_code,
				adresReCaptchaResponse: null,
			},
			{
				withCredentials: true,
				headers: {
					__RequestVerificationToken: this.nviCache.get('token'),
				},
			}
		);
		if (nvi.data?.success === false) {
			return {
				success: false,
				message: nvi.data.message,
			};
		}
		return {
			success: true,
			data: {
				adsress: this.firstLetterToUpperCase(nvi.data.acikAdres),
				address_code: nvi.data.adresNo,
			},
		};
	}
}

module.exports = new nviClass();
