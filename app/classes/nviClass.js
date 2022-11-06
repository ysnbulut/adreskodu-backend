require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const url = require('url');
const Redis = require('ioredis');
const cyrptoJS = require('crypto-js');
const Hashids = require('hashids');
const hashids = new Hashids(process.env.HASHID_SALT, parseInt(process.env.HASHID_LENGTH));
class nviClass {
  constructor() {
    const redisUrl = url.parse(process.env.REDISCLOUD_URL);
    this.redis = new Redis({
      host: redisUrl.hostname,
      port: redisUrl.port,
      password: redisUrl.auth.split(':')[1],
    });
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
    const { config, data } = await this.client.get('Home');
    const ch = cheerio.load(data);
    this.redis.set('token', ch('input[name=__RequestVerificationToken]').val(), 'EX', 120);
    this.axiosConfig.headers.__RequestVerificationToken = await this.redis.get('token');
    this.client = wrapper(axios.create(this.axiosConfig));
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
  }

  async getProvinces() {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/ilListesi');
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    const response = data.map((province) => {
      return {
        label: province.adi.toUpperCase(),
        value: hashids.encode(`${province.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
      };
    });
    return {
      success: true,
      data: response,
    };
  }

  async getDistricts(province_id) {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/ilceListesi', {
      ilKimlikNo: province_id,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    const response = data.map((district) => {
      return {
        label: this.firstLetterToUpperCase(district.adi),
        value: hashids.encode(`${district.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
      };
    });
    return response;
  }

  async getNeighborhoods(district_id) {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/mahalleKoyBaglisiListesi', {
      ilceKimlikNo: district_id,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    const response = data.map((neighborhood) => {
      return {
        label: this.firstLetterToUpperCase(neighborhood.bilesenAdi),
        value: hashids.encode(`${neighborhood.kimlikNo}${Math.floor(100 + Math.random() * 899)}`),
      };
    });
    return {
      success: true,
      data: response,
    };
  }

  async getStreets(neighborhood_id) {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/yolListesi', {
      mahalleKoyBaglisiKimlikNo: neighborhood_id,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    const response = data.map((street) => {
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
    return {
      success: true,
      data: response,
    };
  }

  async getBuildings(neighborhood_id, street_id) {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/binaListesi', {
      mahalleKoyBaglisiKimlikNo: neighborhood_id,
      yolKimlikNo: street_id,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    const response = data.map((building) => {
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
    console.log(neighborhood_id, building_id);
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/bagimsizBolumListesi', {
      mahalleKoyBaglisiKimlikNo: neighborhood_id,
      binaKimlikNo: building_id,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    console.log(data);
    const response = data.map((door) => {
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

  async getFullAddress(registration_number = null, addres_code = null) {
    this.jar = new CookieJar(await this.redis.get('cookie_jar'));
    const { config, request, data } = await this.client.post('Harita/AcikAdres', {
      bagimsizBolumKayitNo: registration_number,
      bagimsizBolumAdresNo: addres_code,
      adresReCaptchaResponse: null,
    });
    this.redis.set('cookie_jar', JSON.stringify(config.jar.toJSON()), 'EX', 120);
    if (data?.success === false) {
      return {
        success: false,
        message: data.message,
        request_header: request._header,
      };
    }
    return {
      success: true,
      data: {
        adsress: this.firstLetterToUpperCase(data.acikAdresModel.acikAdresAciklama),
        address_code: data.adresNo,
      },
    };
  }
}

module.exports = new nviClass();
