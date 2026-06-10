import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"
import { KategoriKatalogSection } from "@/components/kategori-katalog-section"
import { KenapaPilihKamiSection } from "@/components/kenapa-pilih-kami-section"
import { FiturUndanganSection } from "@/components/fitur-undangan-section"
import { CaraPemesananSection } from "@/components/cara-pemesanan-section"
import { CTASection } from "@/components/cta-section"
import {
  fetchLandingSections,
  getSectionContent,
  hasItems,
  strOrUndefined,
} from "@/lib/landing-sections"

export default async function Home() {
  const { sectionMap } = await fetchLandingSections()
  const hasDbData = sectionMap !== null

  const heroContent = getSectionContent(sectionMap, "hero")
  const kenapaContent = getSectionContent(sectionMap, "kenapa_kami")
  const fiturContent = getSectionContent(sectionMap, "fitur")
  const testimoniContent = getSectionContent(sectionMap, "testimoni")
  const caraPesanContent = getSectionContent(sectionMap, "cara_pesan")
  const ctaContent = getSectionContent(sectionMap, "cta")
  const footerContent = getSectionContent(sectionMap, "footer")

  const showHero = !hasDbData || !!sectionMap?.hero
  const showKenapa =
    !hasDbData || (!!sectionMap?.kenapa_kami && hasItems(kenapaContent?.items))
  const showFitur =
    !hasDbData || (!!sectionMap?.fitur && hasItems(fiturContent?.items))
  const showTestimoni =
    !hasDbData || (!!sectionMap?.testimoni && hasItems(testimoniContent?.items))
  const showCaraPesan =
    !hasDbData || (!!sectionMap?.cara_pesan && hasItems(caraPesanContent?.items))
  const showCta = !hasDbData || !!sectionMap?.cta
  const showFooter = !hasDbData || !!sectionMap?.footer

  return (
    <main className="min-h-screen bg-background">
      <Header />
      {showHero && (
        <HeroSection
          heading={strOrUndefined(heroContent?.heading)}
          subheading={strOrUndefined(heroContent?.subheading)}
        />
      )}
      <KategoriKatalogSection />
      {showKenapa && (
        <KenapaPilihKamiSection
          heading={strOrUndefined(kenapaContent?.heading)}
          subheading={strOrUndefined(kenapaContent?.subheading)}
          items={
            kenapaContent?.items as
              | { icon: string; judul: string; deskripsi: string }[]
              | undefined
          }
        />
      )}
      {showFitur && (
        <FiturUndanganSection
          heading={strOrUndefined(fiturContent?.heading)}
          subheading={strOrUndefined(fiturContent?.subheading)}
          items={fiturContent?.items as string[] | undefined}
        />
      )}
      {showTestimoni && (
        <TestimonialsSection
          heading={strOrUndefined(testimoniContent?.heading)}
          subheading={strOrUndefined(testimoniContent?.subheading)}
          items={
            testimoniContent?.items as
              | { nama: string; lokasi: string; pesan: string }[]
              | undefined
          }
        />
      )}
      {showCaraPesan && (
        <CaraPemesananSection
          heading={strOrUndefined(caraPesanContent?.heading)}
          subheading={strOrUndefined(caraPesanContent?.subheading)}
          items={
            caraPesanContent?.items as
              | { nomor: string; judul: string; deskripsi: string }[]
              | undefined
          }
        />
      )}
      {showCta && (
        <CTASection
          heading={strOrUndefined(ctaContent?.heading)}
          subheading={strOrUndefined(ctaContent?.subheading)}
          button_1_text={strOrUndefined(ctaContent?.button_1_text)}
          button_1_link={strOrUndefined(ctaContent?.button_1_link)}
          button_2_text={strOrUndefined(ctaContent?.button_2_text)}
          button_2_link={strOrUndefined(ctaContent?.button_2_link)}
        />
      )}
      {showFooter && (
        <Footer
          deskripsi={strOrUndefined(footerContent?.deskripsi)}
          jam_operasional={strOrUndefined(footerContent?.jam_operasional)}
        />
      )}
    </main>
  )
}
