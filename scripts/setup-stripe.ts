/**
 * Script una-tantum per creare prodotti e prezzi su Stripe (test mode).
 * Eseguire con: npx tsx scripts/setup-stripe.ts
 * Dopo l'esecuzione, copiare i price ID in .env.local
 */

import Stripe from 'stripe'
import * as fs from 'fs'
import * as path from 'path'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

async function setup() {
  console.log('🚀 Setup Stripe prodotti in test mode...\n')

  // Piano Basic
  const basicProduct = await stripe.products.create({
    name: 'Burocrazia Basic',
    description: 'Piano Basic per professionisti individuali',
    metadata: { plan: 'basic' },
  })

  const basicPrice = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 990, // €9.90
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Basic Mensile',
  })

  console.log(`✅ Piano Basic creato`)
  console.log(`   Product ID: ${basicProduct.id}`)
  console.log(`   Price ID:   ${basicPrice.id}\n`)

  // Piano Pro
  const proProduct = await stripe.products.create({
    name: 'Burocrazia Pro',
    description: 'Piano Pro per studi e PMI',
    metadata: { plan: 'pro' },
  })

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1990, // €19.90
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Pro Mensile',
  })

  console.log(`✅ Piano Pro creato`)
  console.log(`   Product ID: ${proProduct.id}`)
  console.log(`   Price ID:   ${proPrice.id}\n`)

  // Aggiorna automaticamente .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = fs.readFileSync(envPath, 'utf-8')

  envContent = envContent
    .replace(/STRIPE_PRICE_BASIC=.*/g, `STRIPE_PRICE_BASIC=${basicPrice.id}`)
    .replace(/STRIPE_PRICE_PRO=.*/g, `STRIPE_PRICE_PRO=${proPrice.id}`)

  fs.writeFileSync(envPath, envContent)

  console.log('✅ .env.local aggiornato con i price ID')
  console.log('\n📋 Aggiungi questi valori al tuo .env.local se non aggiornati automaticamente:')
  console.log(`STRIPE_PRICE_BASIC=${basicPrice.id}`)
  console.log(`STRIPE_PRICE_PRO=${proPrice.id}`)
  console.log('\n✨ Setup completato!')
}

setup().catch(console.error)
