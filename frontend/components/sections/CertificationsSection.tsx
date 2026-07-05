'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { Certification } from '@/types';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10 md:mb-12">
      <motion.div 
        className="inline-block bg-black text-[#BFFF00] font-bold text-xs md:text-sm mb-3 px-3 py-1 tracking-[0.2em] uppercase border-2 border-black"
      >
        {subtitle}
      </motion.div>
      <h2 className="font-black text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase text-black leading-none">
        {title}
      </h2>
      <div className="mt-4 w-full max-w-xs h-2 bg-black" />
    </div>
  );
}

export default function CertificationsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const [certs, setCerts] = useState<Certification[]>([]);

  useEffect(() => {
    api.get('/api/certifications').then((r) => setCerts(r.data.data || [])).catch(() => {});
  }, []);

  const handleCertClick = (cert: Certification) => {
    const targetUrl = (cert.credential_url && cert.credential_url !== 'NA') 
      ? cert.credential_url 
      : cert.image_url;
      
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (certs.length === 0) return null;

  return (
    <section id="certifications" ref={ref} className="relative py-20 md:py-24 bg-[#BFFF00] text-black font-sans selection:bg-black selection:text-[#BFFF00] border-b-4 border-black">
      
      {/* Brutalist Background Accent */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
         <div className="absolute bottom-0 left-0 w-full h-[20px] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,black_20px,black_40px)]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionTitle title="Credentials" subtitle="// VERIFIED DATA" />
        </motion.div>

        {/* Tighter Grid Gap for Compact Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {certs.map((cert, i) => {
            const hasLink = (cert.credential_url && cert.credential_url !== 'NA') || cert.image_url;

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => handleCertClick(cert)}
                className={`bg-white border-4 border-black flex flex-col h-full hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group ${hasLink ? 'cursor-pointer' : 'cursor-default'}`}
              >
                
                {/* Compact Image Area - No padding, white background */}
                <div className="relative h-44 bg-white border-b-4 border-black shrink-0 overflow-hidden flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                  
                  {/* Compact Issuer Badge */}
                  <div className="absolute top-3 left-3 bg-black text-[#BFFF00] font-black text-[9px] uppercase tracking-widest px-2 py-1 border-2 border-black z-10">
                    {cert.issuer}
                  </div>
                  
                  {/* External Link Icon */}
                  {hasLink && (
                    <div className="absolute top-3 right-3 bg-[#BFFF00] text-black border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <ExternalLink size={14} className="stroke-[3px]" />
                    </div>
                  )}

                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]">
                      <Award size={36} className="text-black/20 mb-2 stroke-[2px]" />
                      <span className="font-black text-black/40 uppercase tracking-widest text-[10px]">NO PREVIEW</span>
                    </div>
                  )}
                </div>

                {/* Content Area - Reduced Padding */}
                <div className="p-4 md:p-5 flex flex-col flex-grow relative bg-white">
                  
                  <h3 className="font-black text-lg uppercase tracking-tighter text-black mb-5 line-clamp-2 leading-tight">
                    {cert.title}
                  </h3>

                  {/* Brutalist Data Table - Compact Version */}
                  <div className="mt-auto flex flex-col border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(191,255,0,1)] transition-shadow">
                    
                    <div className="flex justify-between items-center border-b-2 border-black px-3 py-2 bg-gray-50">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/50">Issued</span>
                      <span className="text-[10px] font-black uppercase text-black">{cert.issue_date}</span>
                    </div>
                    
                    {cert.expiry_date && (
                      <div className="flex justify-between items-center border-b-2 border-black px-3 py-2 bg-gray-50">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/50">Expires</span>
                        <span className="text-[10px] font-black uppercase text-black">{cert.expiry_date}</span>
                      </div>
                    )}

                    {cert.credential_id && (
                      <div className="flex justify-between items-center px-3 py-2 bg-[#BFFF00]">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/70">ID</span>
                        <span className="text-[10px] font-black uppercase text-black truncate ml-3">{cert.credential_id}</span>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}