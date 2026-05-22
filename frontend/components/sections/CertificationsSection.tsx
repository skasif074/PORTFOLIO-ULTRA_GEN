'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Certification } from '@/types';

export default function CertificationsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [certs, setCerts] = useState<Certification[]>([]);

  useEffect(() => {
    api.get('/api/certifications').then((r) => setCerts(r.data.data || [])).catch(() => {});
  }, []);

  // Handler to open the certificate link or image when the card is clicked
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
    <section id="certifications" ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-accent/3 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-emerald-accent font-mono text-sm mb-3 tracking-widest uppercase">// credentials</p>
          <h2 className="font-display text-4xl lg:text-5xl font-black gradient-text">Certifications</h2>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-emerald-accent to-electric-blue rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert, i) => {
            const hasLink = (cert.credential_url && cert.credential_url !== 'NA') || cert.image_url;

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => handleCertClick(cert)}
                // Added cursor-pointer conditionally so the mouse changes on hover
                className={`glass rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-accent/20 transition-all group ${hasLink ? 'cursor-pointer' : ''}`}
              >
                {/* Cert image/thumbnail */}
                <div className="h-40 bg-gradient-to-br from-emerald-accent/10 to-electric-blue/10 overflow-hidden relative">
                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award size={48} className="text-emerald-accent opacity-30" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-emerald-accent transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-emerald-accent text-xs font-medium mb-2">{cert.issuer}</p>

                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                    <Calendar size={11} />
                    {cert.issue_date}
                    {cert.expiry_date && ` · Expires ${cert.expiry_date}`}
                  </div>

                  {cert.credential_id && (
                    <p className="text-slate-600 text-xs font-mono mb-3">ID: {cert.credential_id}</p>
                  )}

                  {/* Changed from <a> to <div> to avoid nested HTML link conflicts */}
                  {cert.credential_url && cert.credential_url !== 'NA' && (
                    <div className="flex items-center gap-1.5 text-xs text-electric-blue group-hover:text-neon-purple transition-colors">
                      <ExternalLink size={11} /> View Certificate
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}