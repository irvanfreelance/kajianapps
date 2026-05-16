"use client";
import { useState, useEffect } from "react";
import { MapPin, Truck, ChevronDown, Loader2 } from "lucide-react";

interface AddressSelectorProps {
  onSelect: (data: any) => void;
  weight?: number;
}

// Searchable Select Component (Moved outside to prevent focus loss)
const SearchableSelect = ({ 
  label, value, placeholder, items, loading, onSelect, search, setSearch, debouncedSearch, showList, setShowList, labelKey, valueKey, disabled 
}: any) => {
  const selectedItem = items.find((i: any) => i[valueKey] === value);
  const displayValue = showList ? search : (selectedItem ? selectedItem[labelKey] : "");
  
  const filtered = items
    .filter((item: any) => item[labelKey].toLowerCase().includes(debouncedSearch.toLowerCase()))
    .slice(0, 10);

  return (
    <div style={{ position: "relative" }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!showList) setShowList(true);
          }}
          onFocus={() => {
            if (selectedItem && (search === "" || search === selectedItem[labelKey])) {
              setSearch("");
            }
            setShowList(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowList(false), 300);
          }}
          placeholder={placeholder}
          disabled={loading || disabled}
          style={{ 
            width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #E2E8F0", 
            fontSize: 14, outline: "none", background: (loading || disabled) ? "#F8FAFC" : "#fff",
            cursor: (loading || disabled) ? "not-allowed" : "text",
            transition: "all 0.2s"
          }}
        />
        {loading ? (
          <Loader2 size={16} className="animate-spin" style={{ position: "absolute", right: 12, top: "50%", marginTop: -8, color: "#0891B2" }} />
        ) : (
          <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", marginTop: -8, color: "#94A3B8", pointerEvents: "none" }} />
        )}
      </div>
      
      {showList && !loading && !disabled && (
        <div style={{ 
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#fff", 
          borderRadius: 14, border: "1px solid #E2E8F0", marginTop: 6, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          overflow: "hidden", maxHeight: 250, overflowY: "auto", animation: "fadeIn 0.2s ease"
        }}>
          {filtered.length > 0 ? filtered.map((item: any) => (
            <div
              key={item[valueKey]}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item[valueKey]);
                setSearch(item[labelKey]);
                setShowList(false);
              }}
              style={{ 
                padding: "12px 16px", fontSize: 14, cursor: "pointer", 
                background: value === item[valueKey] ? "#ECFEFF" : "transparent",
                color: value === item[valueKey] ? "#0891B2" : "#1E293B",
                fontWeight: value === item[valueKey] ? 700 : 400
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = value === item[valueKey] ? "#CFFAFE" : "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === item[valueKey] ? "#ECFEFF" : "transparent")}
            >
              {item[labelKey]}
            </div>
          )) : (
            <div style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
              {search.length > 0 ? "Mencari..." : "Mulai mengetik..."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AddressSelector({ onSelect, weight = 1000 }: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [courier, setCourier] = useState("jne");
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);
  const [origin, setOrigin] = useState<any>(null);

  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  
  const [debouncedProv, setDebouncedProv] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [debouncedDist, setDebouncedDist] = useState("");

  const [showProvList, setShowProvList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);
  const [showDistList, setShowDistList] = useState(false);

  useEffect(() => {
    const fetchOrigin = async () => {
      try {
        const res = await fetch("/api/rajaongkir/origin");
        const data = await res.json();
        if (data.name) setOrigin(data);
      } catch (err) {}
    };
    fetchOrigin();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch("/api/rajaongkir/provinces");
        const data = await res.json();
        if (Array.isArray(data)) setProvinces(data);
      } catch (err) {
        console.error("Fetch provinces error:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setSelectedCity("");
        setDistricts([]);
        setSelectedDistrict("");
        try {
          const res = await fetch(`/api/rajaongkir/cities?provinceId=${selectedProvince}`);
          const data = await res.json();
          if (Array.isArray(data)) setCities(data);
        } catch (err) {
          console.error("Fetch cities error:", err);
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setDistricts([]);
        setSelectedDistrict("");
        try {
          const res = await fetch(`/api/rajaongkir/districts?cityId=${selectedCity}`);
          const data = await res.json();
          if (Array.isArray(data)) setDistricts(data);
        } catch (err) {
          console.error("Fetch districts error:", err);
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedCity]);

  // Debounce effects
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProv(searchProvince), 300);
    return () => clearTimeout(timer);
  }, [searchProvince]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(searchCity), 300);
    return () => clearTimeout(timer);
  }, [searchCity]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDist(searchDistrict), 300);
    return () => clearTimeout(timer);
  }, [searchDistrict]);

  const calculateCost = async (districtId: string, courierName: string) => {
    if (!districtId || !courierName) return;
    setLoadingCost(true);
    setServices([]);
    setSelectedService(null);
    try {
      const courierList = "jne:sicepat:jnt:pos:tiki:anteraja:ninja:lion";
      const res = await fetch("/api/rajaongkir/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: districtId,
          weight: weight,
          courier: courierList
        })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.error("Fetch cost error:", err);
    } finally {
      setLoadingCost(false);
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      calculateCost(selectedDistrict, courier);
    }
  }, [selectedDistrict, weight]);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    const provinceName = provinces.find(p => p.province_id === selectedProvince)?.province;
    const cityData = cities.find(c => c.city_id === selectedCity);
    const districtData = districts.find(d => d.subdistrict_id === selectedDistrict);
    
    onSelect({
      address,
      provinceId: selectedProvince,
      provinceName: provinceName,
      cityId: selectedCity,
      cityName: cityData?.city_name,
      subdistrictId: selectedDistrict,
      subdistrictName: districtData?.subdistrict_name,
      postalCode,
      courier: service.service.split(' ')[0],
      courierService: service.service,
      shippingCost: service.cost[0].value,
      totalWeight: weight
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Alamat Lengkap</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Nama jalan, nomor rumah, RT/RW..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #E2E8F0", fontSize: 14, minHeight: 80, outline: "none", transition: "border-color 0.2s" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SearchableSelect
          label="Provinsi"
          value={selectedProvince}
          placeholder="Cari Provinsi..."
          items={provinces}
          loading={loadingProvinces}
          onSelect={setSelectedProvince}
          search={searchProvince}
          setSearch={setSearchProvince}
          debouncedSearch={debouncedProv}
          showList={showProvList}
          setShowList={setShowProvList}
          labelKey="province"
          valueKey="province_id"
        />

        <SearchableSelect
          label="Kota/Kabupaten"
          value={selectedCity}
          placeholder="Cari Kota..."
          items={cities}
          loading={loadingCities}
          onSelect={setSelectedCity}
          search={searchCity}
          setSearch={setSearchCity}
          debouncedSearch={debouncedCity}
          showList={showCityList}
          setShowList={setShowCityList}
          labelKey="city_name"
          valueKey="city_id"
          disabled={!selectedProvince}
        />
      </div>

      <SearchableSelect
        label="Kecamatan"
        value={selectedDistrict}
        placeholder="Cari Kecamatan..."
        items={districts}
        loading={loadingDistricts}
        onSelect={setSelectedDistrict}
        search={searchDistrict}
        setSearch={setSearchDistrict}
        debouncedSearch={debouncedDist}
        showList={showDistList}
        setShowList={setShowDistList}
        labelKey="subdistrict_name"
        valueKey="subdistrict_id"
        disabled={!selectedCity}
      />

      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Kode Pos</label>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="Contoh: 40123"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
        />
      </div>

      <div style={{ height: 1, background: "#F1F5F9", margin: "8px 0" }} />

      {loadingCost && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13, padding: "12px 0" }}>
          <Loader2 size={16} className="animate-spin" />
          Mencari ongkos kirim...
        </div>
      )}

      {services.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>Pilih Layanan Kurir</label>
          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
            {services.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleServiceSelect(s)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px",
                  borderRadius: 14, border: selectedService?.service === s.service ? "2px solid #0891B2" : "1.5px solid #F1F5F9",
                  background: selectedService?.service === s.service ? "#ECFEFF" : "#fff",
                  textAlign: "left", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{s.service}</p>
                  <p style={{ fontSize: 11, color: "#64748B" }}>Estimasi: {s.cost[0].etd} hari</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#0891B2" }}>
                  Rp {s.cost[0].value.toLocaleString("id-ID")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {origin && (
        <div style={{ 
          marginTop: 8, padding: "12px 16px", borderRadius: 12, background: "#F8FAFC", 
          border: "1px dashed #CBD5E1", display: "flex", alignItems: "center", gap: 10 
        }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={16} style={{ color: "#64748B" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Lokasi Pengiriman</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Dikirim dari {origin.name}</p>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
