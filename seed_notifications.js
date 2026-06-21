"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
var db_1 = require("./lib/db");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var templates, e_1, _i, templates_1, t, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding notification templates...');
                    templates = [
                        {
                            id: 1,
                            event_trigger: 'PRODUCT_CHECKOUT_SUCCESS',
                            channel: 'WHATSAPP',
                            message_content: 'Alhamdulillah {nama}, pembayaran pesanan Anda (*{kode_pesanan}*) telah berhasil kami terima. Semoga berkah dan terima kasih atas kepercayaannya.',
                            is_active: true
                        },
                        {
                            id: 2,
                            event_trigger: 'PRODUCT_PAID',
                            channel: 'WHATSAPP',
                            message_content: 'Halo {nama}, pembayaran untuk pesanan Anda (*{kode_pesanan}*) sebesar *Rp {nominal}* telah berhasil kami verifikasi dan diterima. Kami akan segera memproses dan mengemas pesanan Anda. Terima kasih!',
                            is_active: true
                        },
                        {
                            id: 3,
                            event_trigger: 'KAJIAN_CHECKOUT_PENDING',
                            channel: 'WHATSAPP',
                            message_content: 'Halo {nama}, pendaftaran kajian Anda dengan kode {kode_pesanan} sedang menunggu pembayaran sebesar Rp {nominal} via {metode}. Status: {link_status}',
                            is_active: true
                        },
                        {
                            id: 4,
                            event_trigger: 'KAJIAN_FREE_SUCCESS',
                            channel: 'WHATSAPP',
                            message_content: 'Alhamdulillah {nama}, pendaftaran kajian Anda berhasil! Kode pendaftaran: {kode_pesanan}. Sampai jumpa di majelis.',
                            is_active: true
                        },
                        {
                            id: 5,
                            event_trigger: 'PRODUCT_CHECKOUT_PENDING',
                            channel: 'WHATSAPP',
                            message_content: 'Halo {nama}, pesanan produk Anda dengan kode {kode_pesanan} sedang menunggu pembayaran sebesar Rp {nominal} via {metode}. Status: {link_status}',
                            is_active: true
                        },
                        {
                            id: 6,
                            event_trigger: 'KAJIAN_PAID_SUCCESS',
                            channel: 'WHATSAPP',
                            message_content: 'Alhamdulillah {nama}, pembayaran kajian dengan kode {kode_pesanan} telah kami terima. Anda sudah terdaftar sebagai peserta resmi.',
                            is_active: true
                        },
                        {
                            id: 7,
                            event_trigger: 'PRODUCT_SUCCESS_PAID',
                            channel: 'WHATSAPP',
                            message_content: 'Alhamdulillah {nama}, pembayaran produk dengan kode {kode_pesanan} telah kami terima. Pesanan Anda akan segera kami proses.',
                            is_active: true
                        },
                        {
                            id: 8,
                            event_trigger: 'KAJIAN_CHECKOUT_SUCCESS',
                            channel: 'WHATSAPP',
                            message_content: 'Alhamdulillah {nama}, pembayaran pendaftaran kajian Anda (*{kode_pesanan}*) telah berhasil kami terima. Sampai jumpa di lokasi kajian!',
                            is_active: true
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, db_1.sql)("DELETE FROM notification_templates")];
                case 2:
                    _a.sent();
                    console.log('Cleared existing templates');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _i = 0, templates_1 = templates;
                    _a.label = 5;
                case 5:
                    if (!(_i < templates_1.length)) return [3 /*break*/, 10];
                    t = templates_1[_i];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, db_1.sql)("\n        INSERT INTO \"public\".\"notification_templates\" (\"id\", \"event_trigger\", \"channel\", \"message_content\", \"is_active\") \n        VALUES ($1, $2, $3, $4, $5)\n      ", [t.id, t.event_trigger, t.channel, t.message_content, t.is_active])];
                case 7:
                    _a.sent();
                    console.log("Seeded ".concat(t.event_trigger));
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _a.sent();
                    console.error("Error seeding ".concat(t.event_trigger, ":"), e_2.message);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, (0, db_1.sql)("SELECT setval('notification_templates_id_seq', (SELECT MAX(id) FROM notification_templates));")];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 12:
                    e_3 = _a.sent();
                    return [3 /*break*/, 13];
                case 13:
                    console.log('Seed completed.');
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main();
