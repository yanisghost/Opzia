// import React from 'react';
// import { 
//   ShieldCheck, 
//   Target, 
//   Handshake, 
//   Bug, 
//   Rat, 
//   Biohazard, 
//   Zap, 
//   Award, 
//   ThumbsUp,
//   Phone,
//   Mail,
//   MapPin,
//   Star,
//   CheckCircle2,
//   Building2,
//   Building,
//   Utensils,
//   GraduationCap,
//   PlusSquare,
//   User,
//   Factory
// } from 'lucide-react';

// function App() {
//   return (
//     <div className="min-h-screen bg-white text-gray-800 font-sans">
//       <div className="bg-blue-600 text-white p-4 text-center font-bold text-sm">
//         🚀 Backend with JWT Auth & Admin Dashboard complete! Visit <code>/admin</code> (Admin: <b>admin</b> / Pass: <b>adminpassword123</b>).
//       </div>
//       {/* Top Bar */}
//       <div className="bg-red-700 text-white py-2 px-4 md:px-8 flex flex-wrap justify-between items-center text-sm">
//         <div className="flex items-center gap-4">
//           <span className="flex items-center gap-1"><Phone size={14} /> 0770 84 18 24 / 0550 41 08 25</span>
//           <span className="hidden md:flex items-center gap-1"><Mail size={14} /> infoservice3d@gmail.com</span>
//         </div>
//         <div className="hidden sm:block">
//           Service Professionnel depuis 2021
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="sticky top-0 z-50 bg-white shadow-md py-4 px-4 md:px-8 flex justify-between items-center">
//         <div className="flex flex-col">
//           <div className="flex items-baseline">
//             <ShieldCheck className="text-red-700 mr-2" size={32} strokeWidth={3} />
//             <span className="text-gray-900 font-black text-4xl tracking-tighter">MERIAMINE</span>
//           </div>
//           <div className="flex justify-between items-center w-full mt-1">
//             <div className="h-[2px] bg-red-700 flex-grow mr-2"></div>
//             <div className="text-[9px] tracking-[0.1em] font-bold text-gray-600 uppercase whitespace-nowrap">
//               Dératisation • Désinsectisation • Désinfection
//             </div>
//           </div>
//         </div>
//         <div className="hidden lg:flex gap-8 font-bold text-gray-700 uppercase text-sm">
//           <a href="#services" className="hover:text-red-700 transition">Nos Services</a>
//           <a href="#produits" className="hover:text-red-700 transition">Nos Produits</a>
//           <a href="#choisir" className="hover:text-red-700 transition">Pourquoi Nous Choisir</a>
//           <a href="#clients" className="hover:text-red-700 transition">Nos Clients</a>
//           <a href="#contact" className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition -mt-2">Contactez-Nous</a>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative min-h-[600px] flex items-center overflow-hidden py-12">
//         <div className="absolute inset-0 z-0">
//           <img 
//             src="/hero-pest-control.jpg" 
//             alt="Pest Control Expert" 
//             className="w-full h-full object-cover object-right md:object-center"
//           />
//           <div className="absolute inset-0 bg-white/70 md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/90 md:to-transparent"></div>
//         </div>
        
//         <div className="container mx-auto px-4 md:px-8 relative z-10">
//           <div className="max-w-3xl">
//             <div className="bg-red-700 text-white inline-block px-6 py-3 mb-6 font-black text-2xl md:text-3xl uppercase shadow-lg transform -skew-x-6">
//               Offre de Service
//             </div>
//             <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.1]">
//               VOTRE EXPERT EN <br/>
//               <span className="text-red-700 drop-shadow-sm">HYGIÈNE & PROTECTION</span>
//             </h1>
//             <p className="text-lg md:text-2xl text-gray-800 mb-10 max-w-xl font-medium leading-relaxed">
//               Nous vous proposons des solutions efficaces, durables et sécurisées pour garantir des environnements sains et conformes aux normes d'hygiène.
//             </p>
            
//             {/* Engagements Box */}
//             <div className="bg-[#1a1a1a] text-white p-6 rounded-lg shadow-xl max-w-md">
//               <h3 className="text-center font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-700">Nos Engagements</h3>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="text-center">
//                   <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-white rounded-full">
//                     <Star size={20} />
//                   </div>
//                   <h4 className="text-[10px] font-bold uppercase mb-1">Expertise</h4>
//                   <p className="text-[8px] leading-tight text-gray-400">Une équipe qualifiée et expérimentée à votre service.</p>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-white rounded-full">
//                     <Target size={20} />
//                   </div>
//                   <h4 className="text-[10px] font-bold uppercase mb-1">Efficacité</h4>
//                   <p className="text-[8px] leading-tight text-gray-400">Des méthodes et produits performants pour des résultats durables.</p>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-white rounded-full">
//                     <Handshake size={20} />
//                   </div>
//                   <h4 className="text-[10px] font-bold uppercase mb-1">Confiance</h4>
//                   <p className="text-[8px] leading-tight text-gray-400">Transparence, réactivité et respect des normes en vigueur.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="hidden md:flex justify-end items-start pt-10">
//             <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border-l-4 border-red-700">
//                <div className="flex items-center gap-3 text-red-700 font-bold">
//                   <ShieldCheck size={40} />
//                   <div className="leading-tight">
//                     PROTÉGEZ VOTRE SANTÉ ET<br/>VOTRE ENVIRONNEMENT
//                   </div>
//                </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section id="services" className="py-20 bg-gray-50">
//         <div className="container mx-auto px-4 md:px-8">
//           <div className="flex items-center gap-4 mb-12">
//             <h2 className="bg-red-700 text-white px-6 py-2 font-bold uppercase text-xl">Nos Services</h2>
//             <div className="h-1 flex-grow bg-red-700"></div>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="bg-white p-8 shadow-lg border-t-4 border-red-700 group hover:bg-red-700 hover:text-white transition-all duration-300">
//               <div className="w-16 h-16 mb-6 flex items-center justify-center text-red-700 group-hover:text-white transition">
//                 <Rat size={48} />
//               </div>
//               <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Dératisation</h3>
//               <p className="text-gray-600 group-hover:text-red-50 mb-6">
//                 Élimination des rongeurs et prévention contre les infestations.
//               </p>
//               <ul className="space-y-2 text-sm">
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Rats & Souris</li>
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Prévention durable</li>
//               </ul>
//             </div>

//             <div className="bg-white p-8 shadow-lg border-t-4 border-red-700 group hover:bg-red-700 hover:text-white transition-all duration-300">
//               <div className="w-16 h-16 mb-6 flex items-center justify-center text-red-700 group-hover:text-white transition">
//                 <Bug size={48} />
//               </div>
//               <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Désinsectisation</h3>
//               <p className="text-gray-600 group-hover:text-red-50 mb-6">
//                 Traitement contre les insectes rampants et volants: cafards, fourmis, moustiques, punaises, mouches, etc.
//               </p>
//               <ul className="space-y-2 text-sm">
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Insectes rampants</li>
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Insectes volants</li>
//               </ul>
//             </div>

//             <div className="bg-white p-8 shadow-lg border-t-4 border-red-700 group hover:bg-red-700 hover:text-white transition-all duration-300">
//               <div className="w-16 h-16 mb-6 flex items-center justify-center text-red-700 group-hover:text-white transition">
//                 <Biohazard size={48} />
//               </div>
//               <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Désinfection</h3>
//               <p className="text-gray-600 group-hover:text-red-50 mb-6">
//                 Élimination des virus, bactéries, champignons et micro-organismes afin d'assurer la sécurité sanitaire de vos espaces.
//               </p>
//               <ul className="space-y-2 text-sm">
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Virucide & Bactéricide</li>
//                 <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Fongicide</li>
//               </ul>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
//              <div className="text-center">
//                 <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gray-200 rounded-full text-gray-800">
//                   <Zap size={24} />
//                 </div>
//                 <div className="text-[10px] font-bold uppercase">Intervention Rapide</div>
//              </div>
//              <div className="text-center">
//                 <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gray-200 rounded-full text-gray-800">
//                   <Award size={24} />
//                 </div>
//                 <div className="text-[10px] font-bold uppercase">Produits Certifiés</div>
//              </div>
//              <div className="text-center">
//                 <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gray-200 rounded-full text-gray-800">
//                   <ThumbsUp size={24} />
//                 </div>
//                 <div className="text-[10px] font-bold uppercase">Résultats Garantis</div>
//              </div>
//           </div>
//         </div>
//       </section>

//       {/* Products Section */}
//       <section id="produits" className="py-20 bg-white">
//         <div className="container mx-auto px-4 md:px-8">
//           <div className="flex items-center gap-4 mb-12 justify-end">
//             <div className="h-1 flex-grow bg-red-700"></div>
//             <h2 className="bg-red-700 text-white px-6 py-2 font-bold uppercase text-xl text-right">Nos Produits Professionnels Utilisés</h2>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {[
//               { name: "Fendona 60 SC", brand: "syngenta", desc: "Insecticide professionnel à large spectre." },
//               { name: "Demand CS", brand: "syngenta", desc: "Insecticide pour la lutte contre les insectes rampants." },
//               { name: "HILAS EC 50-10", brand: "HILAS", desc: "Insecticide concentré émulsionnable.", highlight: true },
//               { name: "PERSECT 25 WP", brand: "PERSECT", desc: "Insecticide en poudre mouillable à large spectre." },
//               { name: "Agroblock", brand: "Agroblock", desc: "Bloc appât rodenticide prêt à l'emploi." },
//               { name: "LESTOPARAFINATO", brand: "LESTOPARAFINATO", desc: "Paraffine pour le contrôle des insectes rampants." },
//               { name: "SOGEVAL", brand: "SOGEVAL", desc: "Appât rodenticide très attractif et efficace." },
//               { name: "Virkon S", brand: "Virkon", desc: "Désinfectant virucide bactéricide fongicide à large spectre." },
//               { name: "VITOSER", brand: "VITOSER", desc: "Désinfectant détergent désodorisant pour toutes surfaces." }
//             ].map((prod, idx) => (
//               <div key={idx} className="border p-4 flex flex-col items-center text-center hover:shadow-md transition bg-gray-50/50">
//                 <div className={`font-black text-lg mb-1 ${prod.highlight ? 'text-green-600' : 'text-gray-900'}`}>
//                   {prod.name}
//                 </div>
//                 <div className="text-[10px] font-bold text-blue-800 uppercase mb-3 italic">
//                   {prod.brand}
//                 </div>
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   {prod.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
          
//           <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-gray-700">
//             <CheckCircle2 size={18} className="text-red-700" />
//             Tous nos produits sont certifiés et conformes aux normes en vigueur.
//           </div>
//         </div>
//       </section>

//       {/* Why Us & Clients Section */}
//       <section className="py-20 bg-gray-900 text-white overflow-hidden">
//         <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16">
//           <div id="choisir">
//             <h2 className="text-3xl font-black uppercase mb-8 border-l-8 border-red-700 pl-4">Pourquoi Nous Choisir ?</h2>
//             <ul className="space-y-4">
//               {[
//                 "Solutions adaptées à vos besoins",
//                 "Respect des règles d'hygiène et de sécurité",
//                 "Équipe formée et matériel professionnel",
//                 "Suivi et conseil personnalisés",
//                 "Devis gratuit et intervention rapide"
//               ].map((item, idx) => (
//                 <li key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition">
//                   <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center flex-shrink-0">
//                     <CheckCircle2 size={14} />
//                   </div>
//                   <span className="font-semibold">{item}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div id="clients">
//             <h2 className="text-3xl font-black uppercase mb-8 border-l-8 border-red-700 pl-4">Nos Clients</h2>
//             <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
//               {[
//                 { Icon: Building2, name: "Entreprises" },
//                 { Icon: Building, name: "Administrations" },
//                 { Icon: Utensils, name: "Restaurants & Cafés" },
//                 { Icon: GraduationCap, name: "Écoles & Établissements publics" },
//                 { Icon: PlusSquare, name: "Cabinets Médicaux" },
//                 { Icon: User, name: "Particuliers" },
//                 { Icon: Factory, name: "Industries & Entrepôts" },
//               ].map((client, idx) => (
//                 <div key={idx} className="text-center group">
//                   <div className="w-16 h-16 mx-auto mb-3 bg-white/10 flex items-center justify-center rounded-lg group-hover:bg-red-700 transition-colors">
//                     <client.Icon size={32} />
//                   </div>
//                   <div className="text-[10px] font-bold uppercase leading-tight">{client.name}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Contact & Footer */}
//       <footer id="contact" className="bg-gray-50 border-t-8 border-red-700 pt-16 pb-8">
//         <div className="container mx-auto px-4 md:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 mb-16">
//             {/* Left Column: Contact Info */}
//             <div className="space-y-8">
//               <div>
//                 <h2 className="bg-red-700 text-white px-6 py-2 font-black uppercase text-2xl inline-block mb-8 transform -skew-x-6">
//                   Contactez-Nous
//                 </h2>
//                 <div className="grid sm:grid-cols-2 gap-8">
//                   <div className="space-y-6">
//                     <div className="flex items-start gap-4">
//                       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
//                         <Phone size={20} />
//                       </div>
//                       <div>
//                         <div className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Appelez-nous</div>
//                         <div className="font-bold text-gray-900">0770 84 18 24</div>
//                         <div className="font-bold text-gray-900">0550 41 08 25</div>
//                         <div className="text-gray-500 text-sm">026 07 27 21</div>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-4">
//                       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
//                         <Mail size={20} />
//                       </div>
//                       <div>
//                         <div className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Email</div>
//                         <div className="font-bold text-gray-900">infoservice3d@gmail.com</div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-6">
//                     <div className="flex items-start gap-4">
//                       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
//                         <MapPin size={20} />
//                       </div>
//                       <div>
//                         <div className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Adresse</div>
//                         <div className="font-bold text-gray-900">02 Abane Ramdane</div>
//                         <div className="text-gray-600 text-sm italic">Ain Benian, Alger</div>
//                       </div>
//                     </div>
//                     <div className="bg-white p-4 rounded border-l-4 border-red-700 shadow-sm">
//                       <div className="flex items-center gap-2 mb-2">
//                         <MapPin className="text-red-700" size={16} />
//                         <h4 className="font-bold uppercase text-xs">Zone d'Intervention</h4>
//                       </div>
//                       <p className="font-bold text-gray-900">Alger et ses environs</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-[#1a1a1a] text-white p-6 rounded-lg flex items-center justify-between shadow-xl">
//                 <div>
//                   <h3 className="font-black uppercase text-lg leading-tight">Service Professionnel</h3>
//                   <p className="text-red-500 font-bold text-sm">DEPUIS 2021</p>
//                   <div className="flex text-yellow-500 gap-1 mt-2">
//                     {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
//                   </div>
//                 </div>
//                 <ShieldCheck size={50} className="text-red-600 opacity-50" />
//               </div>
//             </div>

//             {/* Right Column: Contact Form */}
//             <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
//               <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
//                 <div className="w-2 h-8 bg-red-700"></div>
//                 Demandez un Devis Gratuit
//               </h3>
//               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nom Complet</label>
//                     <input type="text" placeholder="Votre nom" className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-red-700 transition" />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Téléphone</label>
//                     <input type="tel" placeholder="05XX XX XX XX" className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-red-700 transition" />
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Service Souhaité</label>
//                   <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-red-700 transition appearance-none">
//                     <option>Dératisation</option>
//                     <option>Désinsectisation</option>
//                     <option>Désinfection</option>
//                     <option>Autre / Multi-services</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Votre Message</label>
//                   <textarea rows={4} placeholder="Détails de votre besoin..." className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-red-700 transition"></textarea>
//                 </div>
//                 <button type="submit" className="w-full bg-red-700 text-white font-black uppercase py-4 rounded shadow-lg hover:bg-red-800 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mt-4">
//                   Envoyer ma demande
//                   <Zap size={18} fill="currentColor" />
//                 </button>
//                 <p className="text-[9px] text-gray-400 text-center italic mt-2">
//                   Nous vous répondrons dans les plus brefs délais. Intervention rapide garantie.
//                 </p>
//               </form>
//             </div>
//           </div>

//           <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
//             <div>© {new Date().getFullYear()} MERIAMINE. Tous droits réservés.</div>
//             <div className="flex items-center gap-4">
//                <span>Dératisation</span>
//                <span>Désinsectisation</span>
//                <span>Désinfection</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;
