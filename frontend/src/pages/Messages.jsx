import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSend, FiImage, FiX, FiCheck, 
  FiSearch, FiArrowLeft, FiMessageSquare, FiExternalLink, FiPackage 
} from 'react-icons/fi'
import { conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => String(c.id) === String(conversationId))
      if (conv) {
        setActiveConversation(conv)
        fetchMessages(conv.id)
      }
    } else if (!conversationId && conversations.length > 0 && !activeConversation) {
      // Auto-select first conversation
      setActiveConversation(conversations[0])
      fetchMessages(conversations[0].id)
    }
  }, [conversationId, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await conversationsAPI.getAll()
      const convList = res.data.results || res.data
      setConversations(convList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    setMessagesLoading(true)
    try {
      const res = await conversationsAPI.getMessages(convId)
      setMessages(res.data)
      await conversationsAPI.markRead(convId)
    } catch (err) {
      console.error(err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
    navigate(`/messages/${conv.id}`)
    fetchMessages(conv.id)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!messageInput.trim() && !selectedImage) || sending || !activeConversation) return

    const text = messageInput.trim()
    const image = selectedImage
    setMessageInput('')
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSending(true)

    try {
      await conversationsAPI.sendMessage(activeConversation.id, text, image)
      await fetchMessages(activeConversation.id)
      await fetchConversations()
    } catch (err) {
      console.error(err)
      setMessageInput(text)
      setSelectedImage(image)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(c => {
    const name = c.other_user?.username || ''
    const prodName = c.product?.name || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prodName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="container" style={styles.page}>
      <div style={styles.chatWrapper}>
        {/* Left Side: Conversations List */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Messages</h2>
            <div style={styles.searchBar}>
              <FiSearch style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search chats or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.convList}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <FiMessageSquare style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>No conversations yet.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      ...styles.convItem,
                      backgroundColor: isActive ? '#f0fdfa' : 'transparent',
                      borderLeftColor: isActive ? '#00a49f' : 'transparent',
                    }}
                    type="button"
                  >
                    <div style={styles.avatar}>
                      {conv.other_user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div style={styles.convDetails}>
                      <div style={styles.convTopRow}>
                        <span style={styles.convUsername}>
                          {conv.other_user?.username || 'User'}
                        </span>
                        {conv.last_message && (
                          <span style={styles.convTime}>
                            {new Date(conv.last_message.created).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <div style={styles.convProductTag}>
                        <FiPackage style={{ fontSize: '12px', marginRight: '4px' }} />
                        <span>{conv.product?.name || 'Item'}</span>
                      </div>

                      <div style={styles.convBottomRow}>
                        <span style={styles.lastMsgText}>
                          {conv.last_message ? conv.last_message.message : 'No messages yet'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span style={styles.unreadBadge}>{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right Side: Active Chat */}
        <main style={styles.chatMain}>
          {activeConversation ? (
            <>
              {/* Chat Top Bar with other user and product banner */}
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderUser}>
                  <div style={styles.avatarLarge}>
                    {activeConversation.other_user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 style={styles.activeUsername}>
                      {activeConversation.other_user?.username}
                    </h3>
                    <span style={styles.activeStatusTag}>
                      <span style={styles.statusDot} /> Active Deal Contact
                    </span>
                  </div>
                </div>

                {/* Product mini card */}
                {activeConversation.product && (
                  <Link
                    to={`/products/${activeConversation.product.slug}`}
                    style={styles.productBanner}
                    title="View Product"
                  >
                    {activeConversation.product.image_url ? (
                      <img
                        src={activeConversation.product.image_url}
                        alt=""
                        style={styles.bannerImg}
                      />
                    ) : (
                      <div style={styles.bannerImgPlaceholder}>
                        <FiPackage style={{ fontSize: '18px', color: '#94a3b8' }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={styles.bannerTitle}>{activeConversation.product.name}</p>
                      <p style={styles.bannerPrice}>₹{Number(activeConversation.product.price).toLocaleString('en-IN')}</p>
                    </div>
                    <FiExternalLink style={{ color: '#00a49f', marginLeft: '6px' }} />
                  </Link>
                )}
              </div>

              {/* Messages Stream */}
              <div style={styles.messagesStream}>
                {messagesLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={styles.emptyChatPrompt}>
                    <FiMessageSquare style={{ fontSize: '32px', color: '#00a49f', marginBottom: '8px' }} />
                    <p style={{ fontWeight: 600, color: '#002f34' }}>
                      Say hello to {activeConversation.other_user?.username}!
                    </p>
                    <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Ask questions, verify details, and discuss meeting locations safely.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div
                        key={msg.id}
                        style={{
                          ...styles.messageRow,
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            ...styles.messageBubble,
                            backgroundColor: isMe ? '#002f34' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            borderBottomRightRadius: isMe ? '4px' : '16px',
                            borderBottomLeftRadius: isMe ? '16px' : '4px',
                            boxShadow: isMe
                              ? '0 4px 12px rgba(0, 47, 52, 0.15)'
                              : '0 2px 8px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          {msg.image_url && (
                            <img
                              src={msg.image_url}
                              alt="Attachment"
                              style={styles.messageImageAttachment}
                            />
                          )}
                          {msg.message && <p style={styles.messageText}>{msg.message}</p>}
                          <div
                            style={{
                              ...styles.messageMeta,
                              color: isMe ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8',
                            }}
                          >
                            <span>
                              {new Date(msg.created).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <FiCheck
                                style={{
                                  fontSize: '13px',
                                  color: msg.is_read ? '#5eead4' : 'rgba(255,255,255,0.6)',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div style={styles.inputArea}>
                {/* Image preview chip */}
                {imagePreview && (
                  <div style={styles.imagePreviewChip}>
                    <img src={imagePreview} alt="Preview" style={styles.chipImg} />
                    <span>Image attached</span>
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      style={styles.chipRemoveBtn}
                      type="button"
                    >
                      <FiX />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={styles.chatForm}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={styles.attachBtn}
                    title="Attach Photo"
                  >
                    <FiImage style={{ fontSize: '18px' }} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />

                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    style={styles.chatInput}
                  />

                  <motion.button
                    type="submit"
                    style={{
                      ...styles.sendBtn,
                      opacity: messageInput.trim() || selectedImage ? 1 : 0.6,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={sending || (!messageInput.trim() && !selectedImage)}
                  >
                    <FiSend style={{ fontSize: '16px' }} />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div style={styles.noConvSelected}>
              <FiMessageSquare style={{ fontSize: '56px', color: '#cbd5e1', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#002f34', marginBottom: '6px' }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Choose a conversation from the left to view messages and chat with sellers
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const styles = {
  page: {
    paddingTop: '24px',
    paddingBottom: '40px',
  },
  chatWrapper: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
    height: '78vh',
    minHeight: '560px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '340px',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px 18px',
    borderBottom: '1px solid #f1f5f9',
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#002f34',
    marginBottom: '12px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '8px 12px',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#0f172a',
    width: '100%',
  },
  convList: {
    flex: 1,
    overflowY: 'auto',
  },
  convItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    width: '100%',
    textAlign: 'left',
    borderBottom: '1px solid #f8fafc',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  convDetails: {
    flex: 1,
    minWidth: 0,
  },
  convTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2px',
  },
  convUsername: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  convTime: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  convProductTag: {
    fontSize: '11px',
    color: '#00a49f',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '2px',
  },
  convBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsgText: {
    fontSize: '12.5px',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadBadge: {
    backgroundColor: '#ff5630',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '999px',
    marginLeft: '6px',
  },
  chatMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
  },
  chatHeader: {
    padding: '14px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  chatHeaderUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarLarge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#00a49f',
    color: '#fff',
    fontWeight: '800',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeUsername: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#002f34',
  },
  activeStatusTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#15803d',
    fontWeight: '600',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 5px #10b981',
  },
  productBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: '12px',
    backgroundColor: '#f0fdfa',
    border: '1px solid #ccfbf1',
    maxWidth: '280px',
    textDecoration: 'none',
  },
  bannerImg: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  bannerImgPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  bannerTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bannerPrice: {
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#00a49f',
  },
  messagesStream: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyChatPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    textAlign: 'center',
    fontSize: '36px',
    gap: '6px',
  },
  messageRow: {
    display: 'flex',
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '12px 16px',
    borderRadius: '16px',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.45',
    wordBreak: 'break-word',
  },
  messageImageAttachment: {
    maxWidth: '240px',
    maxHeight: '180px',
    borderRadius: '8px',
    marginBottom: '6px',
    objectFit: 'cover',
  },
  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    fontSize: '10.5px',
    marginTop: '4px',
  },
  inputArea: {
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
  },
  imagePreviewChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '12px',
  },
  chipImg: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  chipRemoveBtn: {
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
  },
  chatForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  attachBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  chatInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0, 164, 159, 0.3)',
  },
  noConvSelected: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    textAlign: 'center',
    padding: '40px',
  },
}
