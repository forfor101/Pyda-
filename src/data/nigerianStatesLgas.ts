export interface NigerianLga {
  name: string;
  isHighDensity?: boolean;
  isIslandOrTollArea?: boolean;
  isIndustrialZone?: boolean;
  terrainFactor?: number; // 1.0 is standard, >1.0 for tricky terrain or congested ports/high-density
}

export interface NigerianState {
  id: string;
  name: string;
  code: string;
  capital: string;
  zone: 'North Central' | 'North East' | 'North West' | 'South East' | 'South South' | 'South West';
  coordinates: { lat: number; lng: number };
  interstateDistanceFactor?: number;
  lgas: NigerianLga[];
}

export const NIGERIAN_STATES_DATA: NigerianState[] = [
  {
    id: 'fct',
    name: 'Federal Capital Territory (Abuja)',
    code: 'FC',
    capital: 'Abuja (AMAC)',
    zone: 'North Central',
    coordinates: { lat: 9.0765, lng: 7.3986 },
    lgas: [
      { name: 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', isHighDensity: true },
      { name: 'Bwari (Kubwa, Bwari, Dutse, Ushafa, Dawaki, Mpape)' },
      { name: 'Gwagwalada' },
      { name: 'Kuje' },
      { name: 'Kwali' },
      { name: 'Abaji' }
    ]
  },
  {
    id: 'lagos',
    name: 'Lagos State',
    code: 'LA',
    capital: 'Ikeja',
    zone: 'South West',
    coordinates: { lat: 6.5244, lng: 3.3792 },
    lgas: [
      { name: 'Agege', isHighDensity: true },
      { name: 'Ajeromi-Ifelodun (Ajegunle, Olodi)', isHighDensity: true },
      { name: 'Alimosho (Egbeda, Ikotun, Igando, Ipaja, Idimu)', isHighDensity: true },
      { name: 'Amuwo-Odofin (Festac Town, Satellite Town, Mile 2, Alakija Hub)' },
      { name: 'Apapa (Port Wharf, Commercial Marine Hub)', isIndustrialZone: true, isHighDensity: true, terrainFactor: 1.15 },
      { name: 'Badagry' },
      { name: 'Epe' },
      { name: 'Eti-Osa (Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron)', isIslandOrTollArea: true, isHighDensity: true },
      { name: 'Ibeju-Lekki (Free Trade Zone, Dangote Refinery, Eleko)', isIndustrialZone: true },
      { name: 'Ifako-Ijaiye (Ogba, Iju-Ishaga)' },
      { name: 'Ikeja (GRA, Alausa, Ikeja City Mall, Maryland, Allen)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Ikorodu' },
      { name: 'Kosofe (Magodo, Ketu, Ojota, Mile 12)', isHighDensity: true },
      { name: 'Lagos Island (Marina, CMS, Broad Street)', isIslandOrTollArea: true, isHighDensity: true },
      { name: 'Lagos Mainland (Yaba, Ebute Metta, Sabo, University Road)', isHighDensity: true },
      { name: 'Mushin (Olosha, Palm Avenue)', isHighDensity: true },
      { name: 'Ojo (Alaba International, Iba, Ojo Barracks)', isHighDensity: true },
      { name: 'Oshodi-Isolo (Oshodi, Ajao Estate, Okota, Mafoluku)', isHighDensity: true },
      { name: 'Shomolu (Bariga, Fadeyi, Palmgrove)', isHighDensity: true },
      { name: 'Surulere (Bode Thomas, Adeniran Ogunsanya, Ojuelegba, Aguda)', isHighDensity: true }
    ]
  },
  {
    id: 'rivers',
    name: 'Rivers State',
    code: 'RI',
    capital: 'Port Harcourt',
    zone: 'South South',
    coordinates: { lat: 4.8156, lng: 7.0498 },
    lgas: [
      { name: 'Abua/Odual' },
      { name: 'Ahoada East' },
      { name: 'Ahoada West' },
      { name: 'Akuku-Toru' },
      { name: 'Andoni' },
      { name: 'Asari-Toru' },
      { name: 'Bonny (Island Oil & Gas Terminal)', isIslandOrTollArea: true, terrainFactor: 1.25 },
      { name: 'Degema' },
      { name: 'Eleme (Onne Oil & Gas Free Zone, Petrochemicals)', isIndustrialZone: true },
      { name: 'Emuoha' },
      { name: 'Etche' },
      { name: 'Gokana' },
      { name: 'Ikwerre' },
      { name: 'Khana' },
      { name: 'Obio/Akpor (Trans-Amadi, Rumuokoro, GRA Phase 1-3, Rumuola)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Ogba/Egbema/Ndoni' },
      { name: 'Ogu/Bolo' },
      { name: 'Okrika' },
      { name: 'Omuma' },
      { name: 'Opobo/Nkoro' },
      { name: 'Oyigbo' },
      { name: 'Port Harcourt City (Old GRA, Town, Diobu, D-Line)', isHighDensity: true },
      { name: 'Tai' }
    ]
  },
  {
    id: 'kano',
    name: 'Kano State',
    code: 'KN',
    capital: 'Kano',
    zone: 'North West',
    coordinates: { lat: 12.0022, lng: 8.592 },
    lgas: [
      { name: 'Ajingi' }, { name: 'Albasu' }, { name: 'Bagwai' }, { name: 'Bebeji' }, { name: 'Bichi' },
      { name: 'Bunkure' }, { name: 'Dala', isHighDensity: true }, { name: 'Dambatta' }, { name: 'Dawakin Kudu' },
      { name: 'Dawakin Tofa' }, { name: 'Doguwa' }, { name: 'Fagge (Sabon Gari, Commercial Hub)', isHighDensity: true },
      { name: 'Gabasawa' }, { name: 'Garko' }, { name: 'Garun Mallam' }, { name: 'Gaya' }, { name: 'Gezawa' },
      { name: 'Gwale', isHighDensity: true }, { name: 'Gwarzo' }, { name: 'Kabo' },
      { name: 'Kano Municipal (Kofar Nassarawa, Kurmi Market, City Center)', isHighDensity: true },
      { name: 'Karaye' }, { name: 'Kibiya' }, { name: 'Kiru' }, { name: 'Kumbotso', isIndustrialZone: true },
      { name: 'Kunchi' }, { name: 'Kura' }, { name: 'Madobi' }, { name: 'Minjibir' },
      { name: 'Nassarawa (Bompai Industrial Area, Kano GRA)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Rano' }, { name: 'Rimin Gado' }, { name: 'Rogo' }, { name: 'Shanono' }, { name: 'Sumaila' },
      { name: 'Takai' }, { name: 'Tarauni (Gyadi-Gyadi, Maiduguri Rd)', isHighDensity: true },
      { name: 'Tofa' }, { name: 'Tsanyawa' }, { name: 'Tudun Wada' }, { name: 'Ungogo' },
      { name: 'Warawa' }, { name: 'Wudil' }
    ]
  },
  {
    id: 'oyo',
    name: 'Oyo State',
    code: 'OY',
    capital: 'Ibadan',
    zone: 'South West',
    coordinates: { lat: 7.3775, lng: 3.947 },
    lgas: [
      { name: 'Afijio' }, { name: 'Akinyele (Moniya, Ojoo, Dry Port)' }, { name: 'Atiba' }, { name: 'Atisbo' },
      { name: 'Egbeda' }, { name: 'Ibadan North (Bodija, Agodi GRA, UI, Secretariat)', isHighDensity: true },
      { name: 'Ibadan North-East (Iwo Road, Agodi Gate)', isHighDensity: true },
      { name: 'Ibadan North-West (Dugbe, Eleyele, Jericho)', isHighDensity: true },
      { name: 'Ibadan South-East (Mapo, Molete, Kudeti)' },
      { name: 'Ibadan South-West (Ring Road, Oluyole Estate, Challenge)', isHighDensity: true },
      { name: 'Ibarapa Central' }, { name: 'Ibarapa East' }, { name: 'Ibarapa North' }, { name: 'Ido' },
      { name: 'Irepo' }, { name: 'Iseyin' }, { name: 'Itesiwaju' }, { name: 'Iwajowa' }, { name: 'Kajola' },
      { name: 'Lagelu' }, { name: 'Ogbomosho North' }, { name: 'Ogbomosho South' }, { name: 'Ogo Oluwa' },
      { name: 'Olorunsogo' }, { name: 'Oluyole' }, { name: 'Ona Ara' }, { name: 'Orelope' }, { name: 'Ori Ire' },
      { name: 'Oyo East' }, { name: 'Oyo West' }, { name: 'Saki East' }, { name: 'Saki West' }, { name: 'Surulere' }
    ]
  },
  {
    id: 'ogun',
    name: 'Ogun State',
    code: 'OG',
    capital: 'Abeokuta',
    zone: 'South West',
    coordinates: { lat: 7.1475, lng: 3.3619 },
    lgas: [
      { name: 'Abeokuta North' }, { name: 'Abeokuta South' },
      { name: 'Ado-Odo/Ota (Ota Industrial Estate, Sango, Igbesa)', isIndustrialZone: true },
      { name: 'Ewekoro' }, { name: 'Ifo (Berger Border, Ojodu-Akute, Mowe, Ibafo)', isHighDensity: true },
      { name: 'Ijebu East' }, { name: 'Ijebu North' }, { name: 'Ijebu North East' }, { name: 'Ijebu Ode' },
      { name: 'Ikenne' }, { name: 'Imeko Afon' }, { name: 'Ipokia' }, { name: 'Obafemi Owode (Arepo, Mowe, Magboro Corridor)' },
      { name: 'Odeda' }, { name: 'Odogbolu' }, { name: 'Ogun Waterside' }, { name: 'Remo North' },
      { name: 'Sagamu (Interchange Freight Hub, Industrial Cluster)', isIndustrialZone: true },
      { name: 'Yewa North' }, { name: 'Yewa South' }
    ]
  },
  {
    id: 'kaduna',
    name: 'Kaduna State',
    code: 'KD',
    capital: 'Kaduna',
    zone: 'North West',
    coordinates: { lat: 10.5105, lng: 7.4165 },
    lgas: [
      { name: 'Birnin Gwari' }, { name: 'Chikun (Barnawa, Sabon Tasha, Refinery)' }, { name: 'Giwa' },
      { name: 'Igabi' }, { name: 'Ikara' }, { name: 'Jaba' }, { name: 'Jema\'a (Kafanchan)' }, { name: 'Kachia' },
      { name: 'Kaduna North (GRA, Malali, Kawo, Independence Way)', isHighDensity: true },
      { name: 'Kaduna South (Kakuri Industrial, Television, Tudun Wada)', isIndustrialZone: true },
      { name: 'Kagarko' }, { name: 'Kajuru' }, { name: 'Kaura' }, { name: 'Kauru' }, { name: 'Kubau' },
      { name: 'Kudan' }, { name: 'Lere' }, { name: 'Makarfi' }, { name: 'Sabon Gari (Zaria)' }, { name: 'Sanga' },
      { name: 'Soba' }, { name: 'Zangon Kataf' }, { name: 'Zaria (Samaru, Zaria City, ABU Corridor)' }
    ]
  },
  {
    id: 'enugu',
    name: 'Enugu State',
    code: 'EN',
    capital: 'Enugu',
    zone: 'South East',
    coordinates: { lat: 6.5244, lng: 7.5086 },
    lgas: [
      { name: 'Aninri' }, { name: 'Awgu' }, { name: 'Enugu East (Abakpa, Trans-Ekulu)', isHighDensity: true },
      { name: 'Enugu North (Independence Layout, GRA, New Haven, Ogbete)', isHighDensity: true },
      { name: 'Enugu South (Achara Layout, Gariki, Uwani)', isHighDensity: true },
      { name: 'Ezeagu' }, { name: 'Igbo Etiti' }, { name: 'Igbo Eze North' }, { name: 'Igbo Eze South' },
      { name: 'Isi Uzo' }, { name: 'Nkanu East' }, { name: 'Nkanu West' }, { name: 'Nsukka (University Town, Opi)' },
      { name: 'Oji River' }, { name: 'Udenu' }, { name: 'Udi' }, { name: 'Uzo Uwani' }
    ]
  },
  {
    id: 'edo',
    name: 'Edo State',
    code: 'ED',
    capital: 'Benin City',
    zone: 'South South',
    coordinates: { lat: 6.335, lng: 5.6037 },
    lgas: [
      { name: 'Akoko-Edo' }, { name: 'Egor (Uselu, Ugbowo UNIBEN)', isHighDensity: true },
      { name: 'Esan Central (Irrua)' }, { name: 'Esan North-East (Uromi)' }, { name: 'Esan South-East' },
      { name: 'Esan West (Ekpoma)' }, { name: 'Etsako Central' }, { name: 'Etsako East' }, { name: 'Etsako West (Auchi)' },
      { name: 'Igueben' }, { name: 'Ikpoba Okha (Aduwawa, Sapele Road bypass, Ikpoba Hill)', isHighDensity: true },
      { name: 'Orhionmwon' }, { name: 'Oredo (GRA, Ring Road, Airport Road, Kings Square)', isHighDensity: true },
      { name: 'Ovia North-East' }, { name: 'Ovia South-West' }, { name: 'Owan East' }, { name: 'Owan West' },
      { name: 'Uhunmwonde' }
    ]
  },
  {
    id: 'delta',
    name: 'Delta State',
    code: 'DE',
    capital: 'Asaba',
    zone: 'South South',
    coordinates: { lat: 6.1983, lng: 6.7324 },
    lgas: [
      { name: 'Aniocha North' }, { name: 'Aniocha South' }, { name: 'Bomadi' }, { name: 'Burutu' },
      { name: 'Ethiope East' }, { name: 'Ethiope West' }, { name: 'Ika North East' }, { name: 'Ika South (Agbor)' },
      { name: 'Isoko North' }, { name: 'Isoko South' }, { name: 'Ndokwa East' }, { name: 'Ndokwa West' },
      { name: 'Okpe' }, { name: 'Oshimili North (Ibusa, Okpanam)' },
      { name: 'Oshimili South (Asaba City Center, Cable Point, GRA)', isHighDensity: true },
      { name: 'Patani' }, { name: 'Sapele (Timber & Port Town)', isIndustrialZone: true },
      { name: 'Udu' }, { name: 'Ughelli North' }, { name: 'Ughelli South' }, { name: 'Ukwuani' },
      { name: 'Uvwie (Effurun, Airport Road)', isHighDensity: true },
      { name: 'Warri North' }, { name: 'Warri South (Warri GRA, Enerhen, NPA Port)', isIndustrialZone: true },
      { name: 'Warri South West' }
    ]
  },
  {
    id: 'anambra',
    name: 'Anambra State',
    code: 'AN',
    capital: 'Awka',
    zone: 'South East',
    coordinates: { lat: 6.2209, lng: 7.0722 },
    lgas: [
      { name: 'Aguata' }, { name: 'Anambra East' }, { name: 'Anambra West' }, { name: 'Anaocha' },
      { name: 'Awka North' }, { name: 'Awka South (Awka GRA, Aroma, UNIZIK Corridor)', isHighDensity: true },
      { name: 'Ayamelum' }, { name: 'Dunukofia' }, { name: 'Ekwusigo' },
      { name: 'Idemili North (Ogidi, Nkpor, Obosi)' }, { name: 'Idemili South' }, { name: 'Ihiala' },
      { name: 'Njikoka' }, { name: 'Nnewi North (Auto Parts Hub, Industrial City)', isIndustrialZone: true },
      { name: 'Nnewi South' }, { name: 'Ogbaru' },
      { name: 'Onitsha North (Main Market, GRA, Old Market Rd)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Onitsha South (Fegge, Bridgehead Market)', isHighDensity: true },
      { name: 'Orumba North' }, { name: 'Orumba South' }, { name: 'Oyi' }
    ]
  },
  {
    id: 'abia',
    name: 'Abia State',
    code: 'AB',
    capital: 'Umuahia',
    zone: 'South East',
    coordinates: { lat: 5.526, lng: 7.4896 },
    lgas: [
      { name: 'Aba North (Ariaria Market, Industrial Hub)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Aba South (Faulks Road, Ekeakpara, Main Commercial)', isHighDensity: true },
      { name: 'Arochukwu' }, { name: 'Bende' }, { name: 'Ikwuano' }, { name: 'Isiala Ngwa North' },
      { name: 'Isiala Ngwa South' }, { name: 'Isuikwuato' }, { name: 'Obi Ngwa' }, { name: 'Ohafia' },
      { name: 'Osisioma Ngwa' }, { name: 'Ugwunagbo' }, { name: 'Ukwa East' }, { name: 'Ukwa West' },
      { name: 'Umuahia North (Government House, GRA, Bende Road)' },
      { name: 'Umuahia South' }, { name: 'Umu Nneochi' }
    ]
  },
  {
    id: 'akwa-ibom',
    name: 'Akwa Ibom State',
    code: 'AK',
    capital: 'Uyo',
    zone: 'South South',
    coordinates: { lat: 5.0377, lng: 7.9128 },
    lgas: [
      { name: 'Abak' }, { name: 'Eastern Obolo' }, { name: 'Eket (Oil Operations Hub)', isIndustrialZone: true },
      { name: 'Esit Eket' }, { name: 'Essien Udim' }, { name: 'Etim Ekpo' }, { name: 'Etinan' },
      { name: 'Ibeno (Mobil Terminal)' }, { name: 'Ibesikpo Asutan' }, { name: 'Ibiono-Ibom' }, { name: 'Ika' },
      { name: 'Ikono' }, { name: 'Ikot Abasi' }, { name: 'Ikot Ekpene (Raffia City)' }, { name: 'Ini' },
      { name: 'Itu' }, { name: 'Mbo' }, { name: 'Mkpat-Enin' }, { name: 'Nsit-Atai' }, { name: 'Nsit-Ibom' },
      { name: 'Nsit-Ubium' }, { name: 'Obot Akara' }, { name: 'Okobo' }, { name: 'Onna' }, { name: 'Oron' },
      { name: 'Oruk Anam' }, { name: 'Udung-Uko' }, { name: 'Ukanafun' }, { name: 'Uruan' }, { name: 'Urue-Offong/Oruko' },
      { name: 'Uyo (Ewet Housing, Shelter Afrique, Banking Layout, Nwaniba)', isHighDensity: true }
    ]
  },
  {
    id: 'cross-river',
    name: 'Cross River State',
    code: 'CR',
    capital: 'Calabar',
    zone: 'South South',
    coordinates: { lat: 4.9757, lng: 8.3417 },
    lgas: [
      { name: 'Abi' }, { name: 'Akamkpa' }, { name: 'Akpabuyo' }, { name: 'Bakassi' }, { name: 'Bekwarra' },
      { name: 'Biase' }, { name: 'Boki' },
      { name: 'Calabar Municipal (State Housing, Marion, Diamond Hill)', isHighDensity: true },
      { name: 'Calabar South (Anantigha, Watt Market, Marina)' },
      { name: 'Etung' }, { name: 'Ikom (Border Trade Corridor)' }, { name: 'Obanliku (Obudu Cattle Ranch)' },
      { name: 'Obubra' }, { name: 'Obudu' }, { name: 'Odukpani' }, { name: 'Ogoja' }, { name: 'Yakuur' },
      { name: 'Yala' }
    ]
  },
  {
    id: 'plateau',
    name: 'Plateau State',
    code: 'PL',
    capital: 'Jos',
    zone: 'North Central',
    coordinates: { lat: 9.8965, lng: 8.8583 },
    lgas: [
      { name: 'Barkin Ladi' }, { name: 'Bassa' }, { name: 'Bokkos' },
      { name: 'Jos East' },
      { name: 'Jos North (Terminus, Ahmadu Bello Way, City Center)', isHighDensity: true },
      { name: 'Jos South (Bukuru, Rayfield, Anglo-Jos Industrial)', isHighDensity: true, isIndustrialZone: true },
      { name: 'Kanam' }, { name: 'Kanke' }, { name: 'Langtang North' }, { name: 'Langtang South' },
      { name: 'Mangu' }, { name: 'Mikang' }, { name: 'Pankshin' }, { name: 'Qua\'an Pan' },
      { name: 'Riyom' }, { name: 'Shendam' }, { name: 'Wase' }
    ]
  },
  {
    id: 'benue',
    name: 'Benue State',
    code: 'BN',
    capital: 'Makurdi',
    zone: 'North Central',
    coordinates: { lat: 7.7322, lng: 8.5218 },
    lgas: [
      { name: 'Ado' }, { name: 'Agatu' }, { name: 'Apa' }, { name: 'Buruku' }, { name: 'Gboko (BCC Cement Hub)' },
      { name: 'Guma' }, { name: 'Gwer East' }, { name: 'Gwer West' }, { name: 'Katsina-Ala' },
      { name: 'Konshisha' }, { name: 'Kwande' }, { name: 'Logo' },
      { name: 'Makurdi (Wurukum, High Level, Modern Market, North Bank)', isHighDensity: true },
      { name: 'Obi' }, { name: 'Ogbadibo' }, { name: 'Ohimini' }, { name: 'Oju' }, { name: 'Okpokwu' },
      { name: 'Otukpo (Otukpo GRA, Commercial Center)' }, { name: 'Tarka' }, { name: 'Ukum' }, { name: 'Ushongo' },
      { name: 'Vandeikya' }
    ]
  },
  {
    id: 'kogi',
    name: 'Kogi State',
    code: 'KG',
    capital: 'Lokoja',
    zone: 'North Central',
    coordinates: { lat: 7.7969, lng: 6.7406 },
    lgas: [
      { name: 'Adavi' }, { name: 'Ajaokuta (Steel Complex & Inland Port)', isIndustrialZone: true },
      { name: 'Ankpa' }, { name: 'Bassa' }, { name: 'Dekina' }, { name: 'Ibaji' }, { name: 'Idah' },
      { name: 'Igalamela-Odolu' }, { name: 'Ijumu' }, { name: 'Kabba/Bunu' }, { name: 'Kogi' },
      { name: 'Lokoja (Confluence Hub, Felele Highway, Ganaja)', isHighDensity: true },
      { name: 'Mopa-Muro' }, { name: 'Ofu' }, { name: 'Ogori/Magongo' }, { name: 'Okehi' },
      { name: 'Okene (Okene Central, Total)' }, { name: 'Olamaboro' }, { name: 'Omala' },
      { name: 'Yagba East' }, { name: 'Yagba West' }
    ]
  },
  {
    id: 'kwara',
    name: 'Kwara State',
    code: 'KW',
    capital: 'Ilorin',
    zone: 'North Central',
    coordinates: { lat: 8.4799, lng: 4.5418 },
    lgas: [
      { name: 'Asa' }, { name: 'Baruten' }, { name: 'Edu' }, { name: 'Ekiti' }, { name: 'Ifelodun' },
      { name: 'Ilorin East' },
      { name: 'Ilorin South (Fate, GRA, Tanke, University Rd)', isHighDensity: true },
      { name: 'Ilorin West (Oja Oba, Taiwo Isale, Adewole)', isHighDensity: true },
      { name: 'Irepodun (Omu-Aran)' }, { name: 'Isin' }, { name: 'Kaiama' }, { name: 'Moro' },
      { name: 'Offa (Offa Commercial Hub)' }, { name: 'Oke Ero' }, { name: 'Oyun' }, { name: 'Pategi' }
    ]
  },
  {
    id: 'nasarawa',
    name: 'Nasarawa State',
    code: 'NA',
    capital: 'Lafia',
    zone: 'North Central',
    coordinates: { lat: 8.4904, lng: 8.52 },
    lgas: [
      { name: 'Akwanga' }, { name: 'Awe' }, { name: 'Doma' },
      { name: 'Karu (Mararaba, Nyanya Corridor, Masaka - Abuja Border)', isHighDensity: true },
      { name: 'Keana' }, { name: 'Keffi (University Town, GRA)' }, { name: 'Kokona' },
      { name: 'Lafia (State Capital, Makurdi Road, City Center)' },
      { name: 'Nasarawa' }, { name: 'Nasarawa Egon' }, { name: 'Obi' }, { name: 'Toto' }, { name: 'Wamba' }
    ]
  },
  {
    id: 'niger',
    name: 'Niger State',
    code: 'NI',
    capital: 'Minna',
    zone: 'North Central',
    coordinates: { lat: 9.6177, lng: 6.5569 },
    lgas: [
      { name: 'Agaie' }, { name: 'Agwara' }, { name: 'Bida (Bida City, Poly Corridor)' }, { name: 'Borgu' },
      { name: 'Bosso (Minna West, FUT Minna)' }, { name: 'Chanchaga (Minna Central, GRA, Bosso Estate)', isHighDensity: true },
      { name: 'Edati' }, { name: 'Gbako' }, { name: 'Gurara' }, { name: 'Katcha' }, { name: 'Kontagora' },
      { name: 'Lapai' }, { name: 'Lavun' }, { name: 'Magama' }, { name: 'Mariga' }, { name: 'Mashegu' },
      { name: 'Mokwa' }, { name: 'Moya' }, { name: 'Paikoro' }, { name: 'Rafi' }, { name: 'Rijau' },
      { name: 'Shiroro' }, { name: 'Suleja (Abuja Gateway, Commercial Center, Madalla)', isHighDensity: true },
      { name: 'Tafa' }, { name: 'Wushishi' }
    ]
  },
  {
    id: 'adamawa',
    name: 'Adamawa State',
    code: 'AD',
    capital: 'Yola',
    zone: 'North East',
    coordinates: { lat: 9.3265, lng: 12.3984 },
    lgas: [
      { name: 'Demsa' }, { name: 'Fufore' }, { name: 'Ganye' }, { name: 'Girei' }, { name: 'Gombi' },
      { name: 'Guyuk' }, { name: 'Hong' }, { name: 'Jada' }, { name: 'Lamurde' }, { name: 'Madagali' },
      { name: 'Maiha' }, { name: 'Mayo-Belwa' }, { name: 'Michika' }, { name: 'Mubi North' }, { name: 'Mubi South' },
      { name: 'Numan' }, { name: 'Shelleng' }, { name: 'Song' }, { name: 'Toungo' },
      { name: 'Yola North (Jimeta, Dougirei, Bank Road)', isHighDensity: true },
      { name: 'Yola South (Old Yola Town, Palace)' }
    ]
  },
  {
    id: 'bauchi',
    name: 'Bauchi State',
    code: 'BA',
    capital: 'Bauchi',
    zone: 'North East',
    coordinates: { lat: 10.3158, lng: 9.8442 },
    lgas: [
      { name: 'Alkaleri' }, { name: 'Bauchi (GRA, Central Market, Jos Road)', isHighDensity: true },
      { name: 'Bogoro' }, { name: 'Damban' }, { name: 'Darazo' }, { name: 'Dass' }, { name: 'Gamawa' },
      { name: 'Ganjuwa' }, { name: 'Giade' }, { name: 'Itas/Gadau' }, { name: 'Jama\'are' }, { name: 'Katagum (Azare)' },
      { name: 'Kirfi' }, { name: 'Misau' }, { name: 'Ningi' }, { name: 'Shira' }, { name: 'Tafawa Balewa' },
      { name: 'Toro' }, { name: 'Warji' }, { name: 'Zaki' }
    ]
  },
  {
    id: 'borno',
    name: 'Borno State',
    code: 'BO',
    capital: 'Maiduguri',
    zone: 'North East',
    coordinates: { lat: 11.8311, lng: 13.151 },
    lgas: [
      { name: 'Abadam' }, { name: 'Askira/Uba' }, { name: 'Bama' }, { name: 'Bayo' }, { name: 'Biu' },
      { name: 'Chibok' }, { name: 'Damboa' }, { name: 'Dikwa' }, { name: 'Gubio' }, { name: 'Guzamala' },
      { name: 'Gwoza' }, { name: 'Hawul' }, { name: 'Jere (Custom Area, University of Maiduguri)', isHighDensity: true },
      { name: 'Kaga' }, { name: 'Kala/Balge' }, { name: 'Konduga' }, { name: 'Kukawa' }, { name: 'Kwaya Kusar' },
      { name: 'Mafa' }, { name: 'Magumeri' },
      { name: 'Maiduguri (Metropolitan City, Post Office, Bulumkutu, GRA)', isHighDensity: true },
      { name: 'Marte' }, { name: 'Mobbar' }, { name: 'Monguno' }, { name: 'Ngala' }, { name: 'Nganzai' },
      { name: 'Shani' }
    ]
  },
  {
    id: 'gombe',
    name: 'Gombe State',
    code: 'GO',
    capital: 'Gombe',
    zone: 'North East',
    coordinates: { lat: 10.2897, lng: 11.1673 },
    lgas: [
      { name: 'Akko' }, { name: 'Balanga' }, { name: 'Billiri' }, { name: 'Dukku' }, { name: 'Funakaye' },
      { name: 'Gombe (GRA, Pantami, Main Market, Federal Low Cost)', isHighDensity: true },
      { name: 'Kaltungo' }, { name: 'Kwami' }, { name: 'Nafada' }, { name: 'Shongom' }, { name: 'Yamaltu/Deba' }
    ]
  },
  {
    id: 'taraba',
    name: 'Taraba State',
    code: 'TR',
    capital: 'Jalingo',
    zone: 'North East',
    coordinates: { lat: 8.8937, lng: 11.3596 },
    lgas: [
      { name: 'Ardo Kola' }, { name: 'Bali' }, { name: 'Donga' }, { name: 'Gashaka' }, { name: 'Gassol' },
      { name: 'Ibi' }, { name: 'Jalingo (State Capital, GRA, Mile 6)', isHighDensity: true },
      { name: 'Karim Lamido' }, { name: 'Kurmi' }, { name: 'Lau' }, { name: 'Sardauna (Mambilla Plateau)' },
      { name: 'Takum' }, { name: 'Ussa' }, { name: 'Wukari' }, { name: 'Yorro' }, { name: 'Zing' }
    ]
  },
  {
    id: 'yobe',
    name: 'Yobe State',
    code: 'YO',
    capital: 'Damaturu',
    zone: 'North East',
    coordinates: { lat: 11.747, lng: 11.9608 },
    lgas: [
      { name: 'Bade (Gashua)' }, { name: 'Bursari' },
      { name: 'Damaturu (Nayi Nawa, Gujba Road, GRA)', isHighDensity: true },
      { name: 'Fika' }, { name: 'Fune' }, { name: 'Geidam' }, { name: 'Gujba' }, { name: 'Gulani' },
      { name: 'Jakusko' }, { name: 'Karasuwa' }, { name: 'Machina' }, { name: 'Nangere' }, { name: 'Nguru' },
      { name: 'Potiskum (Major Livestock & Transport Hub)', isHighDensity: true },
      { name: 'Tarmuwa' }, { name: 'Yunusari' }, { name: 'Yusufari' }
    ]
  },
  {
    id: 'jigawa',
    name: 'Jigawa State',
    code: 'JI',
    capital: 'Dutse',
    zone: 'North West',
    coordinates: { lat: 11.7584, lng: 9.339 },
    lgas: [
      { name: 'Auyo' }, { name: 'Babura' }, { name: 'Biriniwa' }, { name: 'Birnin Kudu' }, { name: 'Buji' },
      { name: 'Dutse (Takur, GRA, Federal Secretariat)', isHighDensity: true },
      { name: 'Gagarawa' }, { name: 'Garki' }, { name: 'Gumel' }, { name: 'Guri' }, { name: 'Gwaram' },
      { name: 'Gwiwa' }, { name: 'Hadejia (Fish & Grain Commercial Center)' }, { name: 'Jahun' }, { name: 'Kafin Hausa' },
      { name: 'Kazaure' }, { name: 'Kiri Kasama' }, { name: 'Kiyawa' }, { name: 'Maigatari (Border Free Zone)' },
      { name: 'Malam Madori' }, { name: 'Miga' }, { name: 'Ringim' }, { name: 'Roni' }, { name: 'Sule Tankarkar' },
      { name: 'Taura' }, { name: 'Yankwashi' }
    ]
  },
  {
    id: 'katsina',
    name: 'Katsina State',
    code: 'KT',
    capital: 'Katsina',
    zone: 'North West',
    coordinates: { lat: 12.9889, lng: 7.6009 },
    lgas: [
      { name: 'Bakori' }, { name: 'Batagarawa' }, { name: 'Batsari' }, { name: 'Baure' }, { name: 'Bindawa' },
      { name: 'Charanchi' }, { name: 'Dandume' }, { name: 'Danja' }, { name: 'Dan Musa' }, { name: 'Daura (Emirate City)' },
      { name: 'Dutsin Ma' }, { name: 'Faskari' }, { name: 'Funtua (Textile & Grain Hub)', isIndustrialZone: true },
      { name: 'Ingawa' }, { name: 'Jibia (Border Port)' }, { name: 'Kafur' }, { name: 'Kaita' }, { name: 'Kankara' },
      { name: 'Kankia' }, { name: 'Katsina (Kofar Kaura, GRA, Nagogo Road)', isHighDensity: true },
      { name: 'Kurfi' }, { name: 'Kusada' }, { name: 'Mai\'Adua' }, { name: 'Malumfashi' }, { name: 'Mani' },
      { name: 'Mashi' }, { name: 'Matazu' }, { name: 'Musawa' }, { name: 'Rimi' }, { name: 'Sabuwa' },
      { name: 'Safana' }, { name: 'Sandamu' }, { name: 'Zango' }
    ]
  },
  {
    id: 'kebbi',
    name: 'Kebbi State',
    code: 'KE',
    capital: 'Birnin Kebbi',
    zone: 'North West',
    coordinates: { lat: 12.4504, lng: 4.1975 },
    lgas: [
      { name: 'Aleiro' }, { name: 'Arewa Dandi' }, { name: 'Argungu (Fishing Festival Hub)' }, { name: 'Augie' },
      { name: 'Bagudo' }, { name: 'Birnin Kebbi (GRA, Haliru Abdu, Bayan Kara)', isHighDensity: true },
      { name: 'Bunza' }, { name: 'Dandi' }, { name: 'Fakai' }, { name: 'Gwandu' }, { name: 'Jega' },
      { name: 'Kalgo' }, { name: 'Koko/Besse' }, { name: 'Maiyama' }, { name: 'Ngaski' }, { name: 'Sakaba' },
      { name: 'Shanga' }, { name: 'Suru' }, { name: 'Wasagu/Danko' }, { name: 'Yauri (River Port)' },
      { name: 'Zuru' }
    ]
  },
  {
    id: 'sokoto',
    name: 'Sokoto State',
    code: 'SO',
    capital: 'Sokoto',
    zone: 'North West',
    coordinates: { lat: 13.0609, lng: 5.2341 },
    lgas: [
      { name: 'Binji' }, { name: 'Bodinga' }, { name: 'Dange Shuni' }, { name: 'Gada' }, { name: 'Goronyo' },
      { name: 'Gudu' }, { name: 'Gwadabawa' }, { name: 'Illela (Border Hub)' }, { name: 'Isa' }, { name: 'Kebbe' },
      { name: 'Kware' }, { name: 'Rabah' }, { name: 'Sabon Birni' }, { name: 'Shagari' }, { name: 'Silame' },
      { name: 'Sokoto North (Sultan Palace, Central Market, Kanwuri)', isHighDensity: true },
      { name: 'Sokoto South (GRA, Runjin Sambo, Arkilla)', isHighDensity: true },
      { name: 'Tambuwal' }, { name: 'Tangaza' }, { name: 'Tureta' }, { name: 'Wamako (Cement Industrial Area)', isIndustrialZone: true },
      { name: 'Wurno' }, { name: 'Yabo' }
    ]
  },
  {
    id: 'zamfara',
    name: 'Zamfara State',
    code: 'ZA',
    capital: 'Gusau',
    zone: 'North West',
    coordinates: { lat: 12.1628, lng: 6.6614 },
    lgas: [
      { name: 'Anka' }, { name: 'Bakura' }, { name: 'Birnin Magaji/Kiyaw' }, { name: 'Bukkuyum' }, { name: 'Bungudu' },
      { name: 'Gummi' }, { name: 'Gusau (GRA, Canteen Area, Samaru)', isHighDensity: true },
      { name: 'Kaura Namoda' }, { name: 'Maradun' }, { name: 'Maru' }, { name: 'Shinkafi' }, { name: 'Talata Mafara' },
      { name: 'Tsafe' }, { name: 'Zurmi' }
    ]
  },
  {
    id: 'ebonyi',
    name: 'Ebonyi State',
    code: 'EB',
    capital: 'Abakaliki',
    zone: 'South East',
    coordinates: { lat: 6.3249, lng: 8.1137 },
    lgas: [
      { name: 'Abakaliki (Rice Mill Hub, GRA, Water Works)', isHighDensity: true },
      { name: 'Afikpo North' }, { name: 'Afikpo South (Edda)' }, { name: 'Ebonyi' }, { name: 'Ezza North' },
      { name: 'Ezza South' }, { name: 'Ikwo' }, { name: 'Ishielu' }, { name: 'Ivo' }, { name: 'Izzi' },
      { name: 'Ohaozara' }, { name: 'Ohaukwu' }, { name: 'Onicha' }
    ]
  },
  {
    id: 'imo',
    name: 'Imo State',
    code: 'IM',
    capital: 'Owerri',
    zone: 'South East',
    coordinates: { lat: 5.4836, lng: 7.0333 },
    lgas: [
      { name: 'Aboh Mbaise' }, { name: 'Ahiazu Mbaise' }, { name: 'Ehime Mbano' }, { name: 'Ezinihitte' },
      { name: 'Ideato North' }, { name: 'Ideato South' }, { name: 'Ihitte/Uboma' }, { name: 'Ikeduru' },
      { name: 'Isiala Mbano' }, { name: 'Isu' }, { name: 'Mbaitoli' }, { name: 'Ngor Okpala (Airport Corridor)' },
      { name: 'Njaba' }, { name: 'Nkwerre' }, { name: 'Nwangele' }, { name: 'Obowo' }, { name: 'Oguta (Lake Region)' },
      { name: 'Ohaji/Egbema' }, { name: 'Okigwe (Transit Junction)' }, { name: 'Onuimo' }, { name: 'Orlu (Commercial Hub)' },
      { name: 'Orsu' }, { name: 'Oru East' }, { name: 'Oru West' },
      { name: 'Owerri Municipal (Douglas, Wetheral, Ikenegbu, Aladinma)', isHighDensity: true },
      { name: 'Owerri North (Orji, Toronto, Emekuku)', isHighDensity: true },
      { name: 'Owerri West (New Owerri, World Bank, Federal Secretariat, Irete)', isHighDensity: true }
    ]
  },
  {
    id: 'bayelsa',
    name: 'Bayelsa State',
    code: 'BY',
    capital: 'Yenagoa',
    zone: 'South South',
    coordinates: { lat: 4.9267, lng: 6.2676 },
    lgas: [
      { name: 'Brass (Atlantic Terminal)' }, { name: 'Ekeremor' }, { name: 'Kolokuma/Opokuma' },
      { name: 'Nembe' }, { name: 'Ogbia (First Oil Well Oloibiri)' }, { name: 'Sagbama' },
      { name: 'Southern Ijaw' },
      { name: 'Yenagoa (Swali, Tombia Roundabout, Amarata, Ovom)', isHighDensity: true }
    ]
  },
  {
    id: 'ekiti',
    name: 'Ekiti State',
    code: 'EK',
    capital: 'Ado-Ekiti',
    zone: 'South West',
    coordinates: { lat: 7.6211, lng: 5.2215 },
    lgas: [
      { name: 'Ado-Ekiti (GRA, Fajuyi, Basiri, Adebayo)', isHighDensity: true },
      { name: 'Efon' }, { name: 'Ekiti East' }, { name: 'Ekiti South-West' }, { name: 'Ekiti West' },
      { name: 'Emure' }, { name: 'Gbonyin' }, { name: 'Ido-Osi' }, { name: 'Ijero' }, { name: 'Ikere (Industrial Town)' },
      { name: 'Ikole' }, { name: 'Ilejemeje' }, { name: 'Irepodun/Ifelodun' }, { name: 'Ise/Orun' },
      { name: 'Moba' }, { name: 'Oye (Federal University Corridor)' }
    ]
  },
  {
    id: 'ondo',
    name: 'Ondo State',
    code: 'ON',
    capital: 'Akure',
    zone: 'South West',
    coordinates: { lat: 7.2571, lng: 5.2058 },
    lgas: [
      { name: 'Akoko North-East (Ikare)' }, { name: 'Akoko North-West' }, { name: 'Akoko South-East' },
      { name: 'Akoko South-West' },
      { name: 'Akure North' },
      { name: 'Akure South (Alagbaka GRA, Oba Adesida, FUTA Corridor)', isHighDensity: true },
      { name: 'Ese Odo' }, { name: 'Idanre (Hills)' }, { name: 'Ifedore' }, { name: 'Ilaje' },
      { name: 'Ile Oluji/Okeigbo' }, { name: 'Irele' }, { name: 'Odigbo (Ore Highway Commercial Hub)', isIndustrialZone: true },
      { name: 'Okitipupa' }, { name: 'Ondo East' }, { name: 'Ondo West (Ondo City)' }, { name: 'Ose' },
      { name: 'Owo (Historic Commercial Hub)' }
    ]
  },
  {
    id: 'osun',
    name: 'Osun State',
    code: 'OS',
    capital: 'Osogbo',
    zone: 'South West',
    coordinates: { lat: 7.7827, lng: 4.5418 },
    lgas: [
      { name: 'Atakunmosa East' }, { name: 'Atakunmosa West' }, { name: 'Aiyedaade' }, { name: 'Aiyedire' },
      { name: 'Boluwaduro' }, { name: 'Boripe' }, { name: 'Ede North' }, { name: 'Ede South' },
      { name: 'Ife Central (Ile-Ife, OAU Campus)' }, { name: 'Ife East' }, { name: 'Ife North' }, { name: 'Ife South' },
      { name: 'Egbedore' }, { name: 'Ejigbo' }, { name: 'Ifedayo' }, { name: 'Ifelodun' }, { name: 'Ila' },
      { name: 'Ilesa East' }, { name: 'Ilesa West (Ilesha Brewery/Commercial)' }, { name: 'Irepodun' },
      { name: 'Irewole (Ikire)' }, { name: 'Isokan' }, { name: 'Iwo' }, { name: 'Obokun' }, { name: 'Odo Otin' },
      { name: 'Ola Oluwa' }, { name: 'Olorunda' }, { name: 'Oriade' }, { name: 'Orolu' },
      { name: 'Osogbo (Alekuwodo, Gbongan Rd, GRA, Station Rd)', isHighDensity: true }
    ]
  }
];

// Helper: Haversine distance in KM between coordinates
export function getCoordinatesDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Road network factor: Nigerian highway routes average ~1.32x straight line distance
  return Math.round(straightLine * 1.32);
}

export interface MoveQuoteCalculationResult {
  originStateName: string;
  originLgaName: string;
  destinationStateName: string;
  destinationLgaName: string;
  isSameState: boolean;
  isSameLga: boolean;
  distanceKm: number;
  estimatedTransitHours: string;
  baseRateNaira: number;
  distanceChargeNaira: number;
  staircaseSurchargeNaira: number;
  acInstallationNaira: number;
  tvMountingNaira: number;
  cleaningFeeNaira: number;
  accessTerrainSurchargeNaira: number;
  packingCratingNaira: number;
  storageAllotmentNaira: number;
  insuranceCoverNaira: number;
  totalEstimatedNaira: number;
  totalEstimatedUsd: number;
  recommendedVehicle: string;
  crewSize: number;
  routeTier: 'Intra-LGA Direct' | 'Intra-State Hub-to-Hub' | 'Interstate Highway Corridor';
  highlights: string[];
  floorLevel: number;
  hasElevator: boolean;
  acUnitsCount: number;
  tvMountCount: number;
  needsCleaning: boolean;
  insuranceTier: 'basic' | 'standard' | 'premium';
  fuelPetrolPrice: number;
  fuelDieselPrice: number;
}

export const FUEL_BENCHMARK_RATES = {
  petrolPerLiter: 1460, // Baseline Petrol (PMS): ₦1,460/liter
  dieselPerLiter: 1850, // Baseline Diesel (AGO): ₦1,850/liter
};

export function calculateComprehensiveMoveQuote({
  originStateId,
  originLgaName,
  destinationStateId,
  destinationLgaName,
  serviceType,
  propertySize,
  needsPacking,
  needsStorage,
  needsInsurance,
  insuranceTier = 'standard',
  floorLevel = 0,
  hasElevator = true,
  acUnitsCount = 0,
  tvMountCount = 0,
  needsCleaning = false,
}: {
  originStateId: string;
  originLgaName: string;
  destinationStateId: string;
  destinationLgaName: string;
  serviceType: string;
  propertySize: string;
  needsPacking: boolean;
  needsStorage: boolean;
  needsInsurance: boolean;
  insuranceTier?: 'basic' | 'standard' | 'premium';
  floorLevel?: number;
  hasElevator?: boolean;
  acUnitsCount?: number;
  tvMountCount?: number;
  needsCleaning?: boolean;
}): MoveQuoteCalculationResult {
  const originState = NIGERIAN_STATES_DATA.find((s) => s.id === originStateId) || NIGERIAN_STATES_DATA[0];
  const destState = NIGERIAN_STATES_DATA.find((s) => s.id === destinationStateId) || NIGERIAN_STATES_DATA[1];

  const originLga = originState.lgas.find((l) => l.name === originLgaName) || originState.lgas[0] || { name: originLgaName };
  const destLga = destState.lgas.find((l) => l.name === destinationLgaName) || destState.lgas[0] || { name: destinationLgaName };

  const isSameState = originState.id === destState.id;
  const isSameLga = isSameState && originLga.name === destLga.name;

  const isLagos = originState.id === 'lagos';
  const isAbuja = originState.id === 'fct';

  // Base Rate calculation by Property/Volume Size and Regional Hubs
  let baseRate = isLagos ? 150000 : 120000;
  let recommendedVehicle = '3-Ton Covered Box Truck';
  let crewSize = 4;
  const sz = propertySize.toLowerCase();

  if (isSameState) {
    // -------------------------------------------------------------
    // INTRA-CITY / INTRA-STATE BASE MOVING RATES
    // -------------------------------------------------------------
    if (sz.includes('1-bedroom') || sz.includes('1 bed') || sz.includes('1-bed')) {
      baseRate = isLagos ? 150000 : 120000;
      recommendedVehicle = '3-Ton Covered Box Truck';
      crewSize = 3;
    } else if (sz.includes('2-bedroom') || sz.includes('2 bed') || sz.includes('2-bed')) {
      baseRate = isLagos ? 280000 : 220000;
      recommendedVehicle = '3-Ton or 5-Ton Covered Box Truck';
      crewSize = 4;
    } else if (sz.includes('3-bedroom') || sz.includes('3 bed') || sz.includes('4-bedroom') || sz.includes('duplex') || sz.includes('3-4 bedroom')) {
      baseRate = isLagos ? 450000 : 380000;
      recommendedVehicle = '5-Ton or 10-Ton Covered Heavy Truck';
      crewSize = 6;
    } else if (sz.includes('studio') || sz.includes('self-contain') || sz.includes('mini')) {
      baseRate = isLagos ? 95000 : 85000;
      recommendedVehicle = '1.5-Ton Enclosed Sprinter Van';
      crewSize = 2;
    } else if (sz.includes('3-ton') || sz.includes('3.5-ton')) {
      baseRate = isLagos ? 180000 : 150000;
      recommendedVehicle = '3-Ton Covered Box Truck';
      crewSize = 3;
    } else if (sz.includes('5-ton')) {
      baseRate = isLagos ? 280000 : 240000;
      recommendedVehicle = '5-Ton Covered Box Truck';
      crewSize = 4;
    } else if (sz.includes('small office')) {
      baseRate = isLagos ? 480000 : 420000;
      recommendedVehicle = '5-Ton Covered Truck';
      crewSize = 5;
    } else if (sz.includes('medium office') || sz.includes('commercial')) {
      baseRate = isLagos ? 980000 : 850000;
      recommendedVehicle = '10-Ton Truck + Equipment Rigging Team';
      crewSize = 8;
    } else if (sz.includes('large office') || sz.includes('headquarters') || sz.includes('hq')) {
      baseRate = isLagos ? 2600000 : 2200000;
      recommendedVehicle = 'Multi-Fleet Dispatch (2x 10-Ton + 1x Escort Van)';
      crewSize = 14;
    } else if (sz.includes('10-ton')) {
      baseRate = isLagos ? 380000 : 320000;
      recommendedVehicle = '10-Ton Heavy Freight Truck';
      crewSize = 3;
    } else if (sz.includes('30-ton') || sz.includes('container')) {
      baseRate = isLagos ? 750000 : 680000;
      recommendedVehicle = '30-Ton Lowbed / Container Chassis';
      crewSize = 4;
    } else {
      if (serviceType === 'corporate') {
        baseRate = isLagos ? 680000 : 580000;
        recommendedVehicle = '10-Ton Covered Truck + IT Disassembly Team';
        crewSize = 6;
      } else if (serviceType === 'commercial') {
        baseRate = isLagos ? 780000 : 680000;
        recommendedVehicle = '10-Ton Heavy Rig + Forklift Team';
        crewSize = 6;
      } else if (serviceType === 'haulage') {
        baseRate = isLagos ? 520000 : 450000;
        recommendedVehicle = '10-Ton to 30-Ton Freight Rig';
        crewSize = 3;
      }
    }
  } else {
    // -------------------------------------------------------------
    // INTERSTATE RELOCATION BASE MOVING FARES (Lagos <-> Abuja & Hubs)
    // -------------------------------------------------------------
    if (sz.includes('5-ton') || sz.includes('2-bedroom') || sz.includes('2 bed') || sz.includes('medium office')) {
      baseRate = 1100000; // 5-Ton Covered Box Truck Interstate base fare
      recommendedVehicle = '5-Ton Covered Box Truck';
      crewSize = 5;
    } else if (sz.includes('10-ton') || sz.includes('3-bedroom') || sz.includes('3-4 bedroom') || sz.includes('duplex') || sz.includes('corporate') || sz.includes('large office')) {
      baseRate = 1650000; // 10-Ton Heavy Covered Truck
      recommendedVehicle = '10-Ton Covered Heavy Truck';
      crewSize = 6;
    } else if (sz.includes('30-ton') || sz.includes('container')) {
      baseRate = 2400000;
      recommendedVehicle = '30-Ton Lowbed / Container Chassis';
      crewSize = 4;
    } else {
      // 3-Ton Covered Box Truck baseline fare: ₦650,000
      baseRate = 650000;
      recommendedVehicle = '3-Ton Covered Box Truck';
      crewSize = 4;
    }
  }

  // Distance computation
  let distanceKm = 0;
  let estimatedTransitHours = '2 - 4 Hours';
  let routeTier: 'Intra-LGA Direct' | 'Intra-State Hub-to-Hub' | 'Interstate Highway Corridor' = 'Intra-LGA Direct';

  if (isSameLga) {
    distanceKm = 15;
    estimatedTransitHours = '1 - 3 Hours (Local Doorstep)';
    routeTier = 'Intra-LGA Direct';
  } else if (isSameState) {
    distanceKm = 45;
    estimatedTransitHours = '3 - 5 Hours (Intra-State Route)';
    routeTier = 'Intra-State Hub-to-Hub';
  } else {
    // Interstate calculation
    const calcDist = getCoordinatesDistanceKm(
      originState.coordinates.lat,
      originState.coordinates.lng,
      destState.coordinates.lat,
      destState.coordinates.lng
    );
    distanceKm = Math.max(calcDist, 180);
    const avgSpeed = 60; // km/h commercial truck safe speed
    const hrs = Math.round(distanceKm / avgSpeed);
    estimatedTransitHours = `${hrs} - ${hrs + 4} Hours (Interstate Highway)`;
    routeTier = 'Interstate Highway Corridor';
  }

  // Distance Surcharge using Fuel Multiplier (Petrol: ₦1,460/L, Diesel: ₦1,850/L)
  let distanceChargeNaira = 0;
  if (isSameLga) {
    // Local intra-city route: urban petrol burn @ ₦1,460/L
    const localFuelFactor = FUEL_BENCHMARK_RATES.petrolPerLiter / 6.5; // ~₦224.6/km
    distanceChargeNaira = Math.round(distanceKm * localFuelFactor);
  } else if (isSameState) {
    // Intra-state corridor: urban petrol @ ₦1,460/L + state arterial logistics factor
    const intraStateFuelFactor = FUEL_BENCHMARK_RATES.petrolPerLiter / 5.5; // ~₦265.4/km
    distanceChargeNaira = Math.round((distanceKm * intraStateFuelFactor) + (baseRate * 0.12));
  } else {
    // Interstate Highway corridor: heavy commercial diesel @ ₦1,850/L
    // Commercial diesel burn ~3.8 km/L -> ~₦487/km. Interstate surcharge at ~₦750/km includes return haulage allowance
    const interstateFuelFactor = Math.round((FUEL_BENCHMARK_RATES.dieselPerLiter / 3.8) * 1.54); // ~₦750/km
    distanceChargeNaira = Math.round(distanceKm * interstateFuelFactor);
  }

  // Staircase Surcharge: Auto-add ₦15,000 per floor level above ground floor if lacks elevator
  let staircaseSurchargeNaira = 0;
  const highlights: string[] = [];

  if (!hasElevator && floorLevel > 0) {
    staircaseSurchargeNaira = floorLevel * 15000;
    highlights.push(`Staircase Surcharge (${floorLevel} floor${floorLevel > 1 ? 's' : ''} carry, no elevator): ₦${staircaseSurchargeNaira.toLocaleString()}`);
  } else if (hasElevator && floorLevel > 0) {
    highlights.push(`Functioning Service Elevator Verified (₦0 Staircase Fee)`);
  }

  // Add-On Optional Items
  // 1. Air Conditioner Removal & Re-installation: ₦20,000 per unit
  const acInstallationNaira = (acUnitsCount || 0) * 20000;
  if (acInstallationNaira > 0) {
    highlights.push(`AC Removal & Re-installation (${acUnitsCount} unit${acUnitsCount > 1 ? 's' : ''}): ₦${acInstallationNaira.toLocaleString()}`);
  }

  // 2. Wall Mounted TV Dismantling/Mounting: ₦10,000 per unit
  const tvMountingNaira = (tvMountCount || 0) * 10000;
  if (tvMountingNaira > 0) {
    highlights.push(`Wall-Mounted TV Dismantling/Mounting (${tvMountCount} unit${tvMountCount > 1 ? 's' : ''}): ₦${tvMountingNaira.toLocaleString()}`);
  }

  // 3. Post-Move Deep Cleaning & Debris Removal: ₦45,000 base fee
  const cleaningFeeNaira = needsCleaning ? 45000 : 0;
  if (needsCleaning) {
    highlights.push('Post-Move Deep Cleaning & Debris Removal included (₦45,000)');
  }

  // Access & Terrain Surcharge (Island toll, port congestion, high density loading areas)
  let accessTerrainSurchargeNaira = 0;
  if (originLga.isIslandOrTollArea || destLga.isIslandOrTollArea) {
    accessTerrainSurchargeNaira += 35000;
    highlights.push('Bridge & Express Toll Passage pre-cleared');
  }
  if (originLga.isIndustrialZone || destLga.isIndustrialZone) {
    accessTerrainSurchargeNaira += 25000;
    highlights.push('Industrial loading dock logistics supported');
  }
  if (originLga.isHighDensity || destLga.isHighDensity) {
    accessTerrainSurchargeNaira += 15000;
    highlights.push('High-density urban street navigation & spotter included');
  }

  // Standard Value-Added Packaging, Storage & Insurance
  let packingCratingNaira = 0;
  if (needsPacking) {
    packingCratingNaira = Math.round(baseRate * 0.20);
    if (packingCratingNaira < 50000) packingCratingNaira = 50000;
    highlights.push('Multi-layer bubble wrap, wardrobe boxes & crating');
  }

  let storageAllotmentNaira = 0;
  if (needsStorage) {
    storageAllotmentNaira = 95000;
    highlights.push('30-Day Climate-Controlled Security Warehousing');
  }

  let insuranceCoverNaira = 0;
  const effectiveInsuranceTier: 'basic' | 'standard' | 'premium' = 
    !needsInsurance ? 'basic' : (insuranceTier || 'standard');

  if (effectiveInsuranceTier === 'basic') {
    insuranceCoverNaira = 0;
    highlights.push('Basic Carrier Valuation Included (₦1,000/kg limited weight liability)');
  } else if (effectiveInsuranceTier === 'standard') {
    insuranceCoverNaira = 45000;
    highlights.push('Standard All-Risk Protection (Up to ₦25M Cover, Leadway & AIICO Backed)');
  } else if (effectiveInsuranceTier === 'premium') {
    insuranceCoverNaira = 95000;
    highlights.push('Premium VIP Full-Replacement Cover (Up to ₦75M, Zero Deductible, 24-48hr Fast-Track)');
  }

  // Fixed-Price Guarantee Notice
  highlights.push('Fixed-Price Guarantee: Quoted price on booking will not change on move day');

  const totalEstimatedNaira = Math.round(
    baseRate +
      distanceChargeNaira +
      staircaseSurchargeNaira +
      acInstallationNaira +
      tvMountingNaira +
      cleaningFeeNaira +
      accessTerrainSurchargeNaira +
      packingCratingNaira +
      storageAllotmentNaira +
      insuranceCoverNaira
  );

  const totalEstimatedUsd = Math.round(totalEstimatedNaira / 1500);

  return {
    originStateName: originState.name,
    originLgaName: originLga.name,
    destinationStateName: destState.name,
    destinationLgaName: destLga.name,
    isSameState,
    isSameLga,
    distanceKm,
    estimatedTransitHours,
    baseRateNaira: baseRate,
    distanceChargeNaira,
    staircaseSurchargeNaira,
    acInstallationNaira,
    tvMountingNaira,
    cleaningFeeNaira,
    accessTerrainSurchargeNaira,
    packingCratingNaira,
    storageAllotmentNaira,
    insuranceCoverNaira,
    totalEstimatedNaira,
    totalEstimatedUsd,
    recommendedVehicle,
    crewSize,
    routeTier,
    highlights,
    floorLevel,
    hasElevator,
    acUnitsCount,
    tvMountCount,
    needsCleaning,
    insuranceTier: effectiveInsuranceTier,
    fuelPetrolPrice: FUEL_BENCHMARK_RATES.petrolPerLiter,
    fuelDieselPrice: FUEL_BENCHMARK_RATES.dieselPerLiter,
  };
}

export const findStateIdFromCity = (cityName: string): string => {
  if (!cityName) return 'lagos';
  const clean = cityName.trim().toLowerCase();
  if (clean.includes('abuja') || clean.includes('fct')) return 'fct';
  if (clean.includes('lagos')) return 'lagos';
  if (clean.includes('rivers') || clean.includes('port harcourt') || clean.includes('ph')) return 'rivers';
  if (clean.includes('kano')) return 'kano';
  if (clean.includes('ibadan') || clean.includes('oyo')) return 'oyo';
  if (clean.includes('enugu')) return 'enugu';
  if (clean.includes('kaduna')) return 'kaduna';
  if (clean.includes('edo') || clean.includes('benin')) return 'edo';
  if (clean.includes('cross river') || clean.includes('calabar')) return 'cross_river';
  if (clean.includes('delta') || clean.includes('asaba') || clean.includes('warri')) return 'delta';
  if (clean.includes('ogun') || clean.includes('abeokuta')) return 'ogun';
  if (clean.includes('akwa ibom') || clean.includes('uyo')) return 'akwa_ibom';
  if (clean.includes('plateau') || clean.includes('jos')) return 'plateau';
  if (clean.includes('anambra') || clean.includes('awka') || clean.includes('onitsha')) return 'anambra';
  if (clean.includes('imo') || clean.includes('owerri')) return 'imo';
  if (clean.includes('ondo') || clean.includes('akure')) return 'ondo';
  if (clean.includes('osun') || clean.includes('osogbo')) return 'osun';
  if (clean.includes('kwara') || clean.includes('ilorin')) return 'kwara';
  if (clean.includes('benue') || clean.includes('makurdi')) return 'benue';
  if (clean.includes('borno') || clean.includes('maiduguri')) return 'borno';
  if (clean.includes('sokoto')) return 'sokoto';
  if (clean.includes('katsina')) return 'katsina';
  if (clean.includes('adamawa') || clean.includes('yola')) return 'adamawa';
  if (clean.includes('bauchi')) return 'bauchi';
  if (clean.includes('niger') || clean.includes('minna')) return 'niger';
  if (clean.includes('nasarawa') || clean.includes('lafia')) return 'nasarawa';
  if (clean.includes('kogi') || clean.includes('lokoja')) return 'kogi';
  if (clean.includes('ekiti') || clean.includes('ado-ekiti')) return 'ekiti';
  if (clean.includes('bayelsa') || clean.includes('yenagoa')) return 'bayelsa';
  if (clean.includes('abia') || clean.includes('umuahia') || clean.includes('aba')) return 'abia';
  if (clean.includes('ebonyi') || clean.includes('abakaliki')) return 'ebonyi';
  if (clean.includes('kebbi') || clean.includes('birnin kebbi')) return 'kebbi';
  if (clean.includes('zamfara') || clean.includes('gusau')) return 'zamfara';
  if (clean.includes('jigawa') || clean.includes('dutse')) return 'jigawa';
  if (clean.includes('yobe') || clean.includes('damaturu')) return 'yobe';
  if (clean.includes('taraba') || clean.includes('jalingo')) return 'taraba';
  if (clean.includes('ghana') || clean.includes('accra')) return 'lagos';
  const match = NIGERIAN_STATES_DATA.find(
    (s) => clean.includes(s.name.toLowerCase()) || clean.includes(s.capital.toLowerCase()) || s.id === clean
  );
  return match ? match.id : 'lagos';
};

