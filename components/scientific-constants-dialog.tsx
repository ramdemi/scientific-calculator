export function ScientificConstantDialog() {
  var constants = [
    {
      code: "const_proton_mass",
      symbol: "mp",
      name: "Proton mass",
      value: 167262189821e-38,
      unit: { __html: "kg" },
    },
    {
      code: "const_neutron_mass",
      symbol: "mn",
      name: "Neutron mass",
      value: 167492747121e-38,
      unit: { __html: "kg" },
    },
    {
      code: "const_electron_mass",
      symbol: "me",
      name: "Electron mass",
      value: 91093835611e-41,
      unit: { __html: "kg" },
    },
    {
      code: "const_moun_mass",
      symbol: "mµ",
      name: "Muon mass",
      value: 188353159448e-39,
      unit: { __html: "kg" },
    },
    {
      code: "const_bohr_radius",
      symbol: "a_0",
      name: "Bohr radius",
      value: 5291772106712e-23,
      unit: { __html: "m" },
    },
    {
      code: "const_planck",
      symbol: "h",
      name: "Planck constant",
      value: 662607004081e-45,
      unit: { __html: "Js" },
    },
    {
      code: "const_nuclear_magneton",
      symbol: "µN",
      name: "Nuclear magneton",
      value: 505078369931e-38,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_bohr_magneton",
      symbol: "µB",
      name: "Bohr magneton",
      value: 927400999457e-35,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_planck_rationalized",
      symbol: "ℏ",
      name: "Planck constant,rationalized",
      value: 105457180013e-45,
      unit: { __html: "Js" },
    },
    {
      code: "const_fine_structure",
      symbol: "α",
      name: "Fine-structure constant",
      value: 0.007297352566417,
      unit: { __html: "" },
    },
    {
      code: "const_classicial_eletron_radius",
      symbol: "re",
      name: "Classical electron radius",
      value: 2817940322719e-27,
      unit: { __html: "m" },
    },
    {
      code: "const_compton_wavelength",
      symbol: "λc",
      name: "Compton wavelength",
      value: 2426310236711e-24,
      unit: { __html: "m" },
    },
    {
      code: "const_proton_gyromagnetic_ratio",
      symbol: "γp",
      name: "Proton gyromagnetic ratio",
      value: 267522190.018,
      unit: {
        __html: "s<sup><small>-1</small></sup>T<sup><small>-1</small></sup>",
      },
    },
    {
      code: "const_proton_compton_wavelength",
      symbol: "λcp",
      name: "Proton Compton wavelength",
      value: 13214098539661e-28,
      unit: { __html: "m" },
    },
    {
      code: "const_neutron_compton_wavelength",
      symbol: "λcn",
      name: "Neutron Compton wavelength",
      value: 13195909048188e-28,
      unit: { __html: "m" },
    },
    {
      code: "const_rydberg",
      symbol: "R∞",
      name: "Rydberg constant",
      value: 10973731.56850865,
      unit: { __html: "m<sup><small>-1</small></sup>" },
    },
    {
      code: "const_atomic_mass",
      symbol: "u",
      name: "Atomic mass constant",
      value: 16605390402e-37,
      unit: { __html: "kg" },
    },
    {
      code: "const_proton_magnetic_moment",
      symbol: "µp",
      name: "Proton magnetic moment",
      value: 1410606787397e-38,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_electron_magnetic_moment",
      symbol: "µe",
      name: "Electron magnetic moment",
      value: -928476462057e-35,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_neutron_magnetic_moment",
      symbol: "µn",
      name: "Neutron magnetic moment",
      value: -9662365023e-36,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_moun_magnetic_moment",
      symbol: "µµ",
      name: "Muon magnetic moment",
      value: -4490448261e-35,
      unit: { __html: "JT<sup><small>-1</small></sup>" },
    },
    {
      code: "const_faraday",
      symbol: "F",
      name: "Faraday constant",
      value: 96485.332895,
      unit: { __html: "Cmol<sup><small>-1</small></sup>" },
    },
    {
      code: "const_elementary_charge",
      symbol: "e",
      name: "Elementary charge",
      value: 1602176620898e-31,
      unit: { __html: "C" },
    },
    {
      code: "const_avogadro",
      symbol: "NA",
      name: "Avogadro constant",
      value: 602214085774e12,
      unit: { __html: "mol<sup><small>-1</small></sup>" },
    },
    {
      code: "const_boltzmann",
      symbol: "k",
      name: "Boltzmann constant",
      value: 13806485279e-33,
      unit: { __html: "JK<sup><small>-1</small></sup>" },
    },
    {
      code: "const_molar_volume_of_ideal",
      symbol: "Vm",
      name: "Molar volume of ideal",
      value: 0.02271094713,
      unit: {
        __html: "m<sup><small>3</small></sup>mol<sup><small>-1</small></sup>",
      },
    },
    {
      code: "const_molar_gas",
      symbol: "R",
      name: "Molar gas constant",
      value: 8.3144598484848,
      unit: {
        __html: "Jmol<sup><small>-1</small></sup>K<sup><small>-1</small></sup>",
      },
    },
    {
      code: "const_speed_of_light_in_vacuum",
      symbol: "C_0",
      name: "Speed of light in vacuum",
      value: 299792458,
      unit: { __html: "ms<sup><small>-1</small></sup>" },
    },
    {
      code: "const_first_radiation",
      symbol: "C₁",
      name: "First radiation constant",
      value: 374177179046e-27,
      unit: { __html: "Wm<sup><small>2</small></sup>" },
    },
    {
      code: "const_second_radiation",
      symbol: "C₂",
      name: "Second radiation constant",
      value: 0.014387773683,
      unit: { __html: "mK" },
    },
    {
      code: "const_stefan_boltzmann",
      symbol: "σ",
      name: "Stefan-Boltzmann constant",
      value: 5.67036713e-8,
      unit: {
        __html: "Wm<sup><small>-2</small></sup>K<sup><small>-4</small></sup>",
      },
    },
    {
      code: "const_electric",
      symbol: "ε_0",
      name: "Electric constant",
      value: 8854187817e-21,
      unit: { __html: "Fm<sup><small>-1</small></sup>" },
    },
    {
      code: "const_magnetic",
      symbol: "µ_0",
      name: "Magnetic constant",
      value: 125663706e-14,
      unit: { __html: "NA<sup><small>-2</small></sup>" },
    },
    {
      code: "const_magnetic_flux_quantum",
      symbol: "φ_0",
      name: "Magnetic flux quantum",
      value: 206783383113e-26,
      unit: { __html: "Wb" },
    },
    {
      code: "const_standard_acceleration_of_gravity",
      symbol: "g",
      name: "Standard acceleration of gravity",
      value: 9.80665,
      unit: { __html: "ms<sup><small>-2</small></sup>" },
    },
    {
      code: "const_conductance_quantum",
      symbol: "G_0",
      name: "Conductance quantum",
      value: 7748091731018e-17,
      unit: { __html: "S" },
    },
    {
      code: "const_characteristic_impedance_of_vacuum",
      symbol: "Z_0",
      name: "Characteristic impedance of vacuum",
      value: 376.730313461,
      unit: { __html: "Ω" },
    },
    {
      code: "const_celsius_temperature",
      symbol: "t",
      name: "Celsius temperature",
      value: 273.15,
      unit: { __html: "K" },
    },
    {
      code: "const_netwonian_of_gravitation",
      symbol: "G",
      name: "Newtonian constant of gravitation",
      value: 66740831e-18,
      unit: {
        __html:
          "m<sup><small>3</small></sup>kg<sup><small>-1</small></sup>s<sup><small>-2</small></sup>",
      },
    },
    {
      code: "const_atm",
      symbol: "atm",
      name: "Standard atmosphere",
      value: 101325,
      unit: { __html: "Pa" },
    },
  ];
  const mark = {
    __html: "<m<sup><small>3</small></sup>mol<sup><small>-1</small></sup> ",
  };

  return (
    <div id="scientific-constant-dialog">
      <dialog
        className="bg-transparent text-inherit undefined xs"
        data-position="center"
        data-set="tt"
        id="scientificConstantDialog"
      >
        <div className="dialog-box py-4 rounded-container">
          <header className="font-bold px-4 mb-2">
            <div>scientific Constants</div>
          </header>
          <main className="px-4">
            <ul className="">
              {constants.map((hyp, i) => (
                <li key={"hyp" + i} data-code={hyp.value} className="list-item">
                  <div className="list-item-index">{i + 1} </div>
                  <div>
                    <div className="list-item-display">{hyp.name}(value)</div>
                    <div className="list-item-description">
                      {hyp.value} <span dangerouslySetInnerHTML={hyp.unit} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </main>
          <footer className="mt-3 px-4 flex items-center justify-end gap-2.5">
            <div>
              <button
                className="relative font-medium overflow-clip rounded inline-flex items-center justify-center !leading-[0.1rem] [&amp;>svg]:stroke-icon transition-all duration-element-react select-none focus-visible:ring-2 outline-none bg-neutral-token-4 text-neutral-token-13 border-neutral-token-4 border hover:bg-neutral-token-5 focus:ring-neutral-token-7 h-8 px-3 gap-1.5 [&amp;>svg]:size-icon-sm"
                value="close"
                onClick={() =>
                  document.getElementById("scientificConstantDialog")?.close()
                }
              >
                close
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
