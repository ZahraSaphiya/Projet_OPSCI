import { useState, useEffect } from 'react'

import { URL, TOKEN } from './conf'
import './App.css'

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr')

type Product = {
  name: string
  description?: string
  stock_available: number
  barcode?: string
  updatedAt: string
  createdAt: string
  statut: 'safe' | 'danger' | 'empty'
}

type Event = {
  updatedAt: string
  createdAt: string
  value: string
  metadata: any
}

const getColor = (statut?: 'safe' | 'danger' | 'empty') => {
  switch (statut) {
    case 'safe':
      return '#00b200'
    case 'danger':
      return '#ee6002'
    case 'empty':
      return '#ff2410'
    default:
      return 'grey'
  }
}

const ProductCard = ({ value }: { value: Product }) => (
  <div className="product-card" style={{ background: getColor(value.attributes.statut) }}>
    <div className="product-card-name">{value.attributes.name}</div>
    <div className="product-card-description">{value.attributes.description}</div>
    <div className="product-card-stock">
      Stock disponible: <b>{value.attributes.stock_available}</b>
    </div>
    <div className="product-card-date">
      <div className="product-card-date">
        Créé le {formatDate(value.attributes.createdAt)}
      </div>
      <div className="product-card-date">
        Modifié le {formatDate(value.attributes.updatedAt)}
      </div>
    </div>
  </div>
)

const EventLine = ({ value }: { value: Event }) => (
  <div
    className="event-line"
    title={value.attributes.value}
    onClick={() => {
      navigator.clipboard.writeText(value.attributes.value)
    }}
  >
    {formatDate(value.attributes.createdAt) + ': '}
    {value.attributes.value}
  </div>
)

const fetchAllPages = async (
  page = 1,
  pagination = true,
  sort = 'createdAt'
) => {
  const res = await fetch(
    URL + `/api/products?sort=${sort}&pagination[page]=${page}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  ).then((r) => r.json())
  
    console.log("Réponse de l'API des produits:", res);
  let result = res.data
  if (pagination && res.meta.pagination.page < res.meta.pagination.pageCount) {
    const rest = await fetchAllPages(page + 1, pagination, sort)
    result = [...result, ...rest]
  }
  return result
}

const fetchAllEvents = async (page = 1, pagination = true) => {
  const res = await fetch(
    URL + '/api/events?sort=createdAt:desc&pagination[page]=' + page,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  ).then((r) => r.json())
  let result = res.data
  if (pagination && res.meta.pagination.page < res.meta.pagination.pageCount) {
    const rest = await fetchAllEvents(page + 1)
    result = [...result, ...rest]
  }
  return result
}

const App = () => {
  const [values, setValues] = useState<{ attributes: Product; id: number }[]>(
    []
  )
  const [events, setEvents] = useState<{ attributes: Event; id: number }[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const interval = setInterval(() => {
    
        fetchAllEvents()
        .then((v) => {
          console.log(v)
          setEvents(v)
        })
        .catch(console.error)

      fetchAllPages()
        .then((v) => {
          console.log('Réponse des produits:', v); // Ajout d'un log ici pour voir les produits récupérés
          setLoading(false)
          setValues(v)
          setError(null)
        })
        .catch((err) => {
          console.error(err)
          setLoading(true)
          setError(err.message + ' ' + URL)
        })
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])
  
  console.log("valeurs des produits dans app" , values);
  return (
    <div>
      {loading ? (
        <div className="load-container">
          <div>{error && <div className="error">{error}</div>}</div>
          <div className="loader"></div>
          <div></div>
        </div>
      ) : (
        <div className="page-container">
          {events.length > 0 && (
            <div className="event-container">
              {events.map((event) => (
                <EventLine key={event.id} value={event} />
              ))}
            </div>
          )}
          <div className="card-container">
            {values.map((value) => (
              <ProductCard value={value} key={value.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
