import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, FiSend, FiImage, FiMessageSquare, FiExternalLink, 
  FiCheck, FiChevronRight 
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MessagesPanel({ isOpen, onClose }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
    }
  }, [activeConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await conversationsAPI.getAll()
      const convList = res.data.results || res.data
      setConversations(convList)
      if (convList.length > 0 && !activeConversation) {
        setActiveConversation(convList[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await conversationsAPI.getMessages(convId)
      setMessages(res.data)
      await conversationsAPI.markRead(convId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
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

  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      <motion.div
        style={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        style={styles.drawer}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      >
        {/* Drawer Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMessageSquare style={{ fontSize: '18px', color: '#00a49f' }} />
            <h3 style={styles.headerTitle}>Instant Chat</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn} type="button">
            <FiX />
          </button>
        </div>

        {/* 2-Section Content */}
        <div style={styles.body}>
          {/* Conversation Selector Strip */}
          {conversations.length > 1 && (
            <div style={styles.convStrip}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversation(c)}
                  style={{
                    ...styles.stripTab,
                    backgroundColor: activeConversation?.id === c.id ? '#002f34' : '#f1f5f9',
                    color: activeConversation?.id === c.id ? '#fff' : '#334155',
                  }}
                  type="button"
                >
                  <span style={styles.stripAvatar}>
                    {c.other_user?.username?.charAt(0).toUpperCase()}
                  </span>
                  <span style={styles.stripName}>{c.other_user?.username}</span>
                  {c.unread_count > 0 && <span style={styles.stripBadge}>{c.unread_count}</span>}
                </button>
              ))}
            </div>
          )}

          {/* Active Chat Header */}
          {activeConversation ? (
            <>
              <div style={styles.chatInfoBar}>
                <div>
                  <h4 style={styles.otherUserName}>
                    {activeConversation.other_user?.username}
                  </h4>
                  <p style={styles.chatItemNotice}>
                    Ad: {activeConversation.product?.name} &bull; ₹{Number(activeConversation.product?.price || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <Link
                  to={`/products/${activeConversation.product?.slug}`}
                  onClick={onClose}
                  style={styles.viewAdLink}
                >
                  View Ad <FiExternalLink />
                </Link>
              </div>

              {/* Messages Area */}
              <div style={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div style={styles.emptyMessages}>
                    <p style={{ fontWeight: 600, color: '#002f34' }}>Start the conversation!</p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Ask questions, verify details, and make your deal.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div
                        key={msg.id}
                        style={{
                          ...styles.msgRow,
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            ...styles.bubble,
                            backgroundColor: isMe ? '#002f34' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            borderBottomRightRadius: isMe ? '4px' : '14px',
                            borderBottomLeftRadius: isMe ? '14px' : '4px',
                          }}
                        >
                          {msg.image_url && (
                            <img src={msg.image_url} alt="" style={styles.bubbleImg} />
                          )}
                          {msg.message && <p style={styles.bubbleText}>{msg.message}</p>}
                          <div
                            style={{
                              ...styles.bubbleMeta,
                              color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
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
                                  fontSize: '12px',
                                  color: msg.is_read ? '#5eead4' : 'rgba(255,255,255,0.5)',
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

              {/* Chat Input */}
              <div style={styles.footer}>
                {imagePreview && (
                  <div style={styles.previewBadge}>
                    <span>Image attached</span>
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      style={{ color: '#ef4444' }}
                      type="button"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} style={styles.form}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={styles.attachBtn}
                  >
                    <FiImage />
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
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    style={styles.input}
                  />

                  <motion.button
                    type="submit"
                    style={styles.sendBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={sending || (!messageInput.trim() && !selectedImage)}
                  >
                    <FiSend />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <FiMessageSquare style={{ fontSize: '42px', marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, color: '#002f34' }}>No Active Chat</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Open an ad and click &quot;Chat with Seller&quot; to begin.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
  },
  drawer: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
    zIndex: 1,
  },
  header: {
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#002f34',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#64748b',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  convStrip: {
    display: 'flex',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  stripTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  stripAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#00a49f',
    color: '#fff',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripName: {
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stripBadge: {
    backgroundColor: '#ff5630',
    color: '#fff',
    fontSize: '9px',
    padding: '1px 5px',
    borderRadius: '999px',
  },
  chatInfoBar: {
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otherUserName: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#002f34',
  },
  chatItemNotice: {
    fontSize: '11.5px',
    color: '#64748b',
    marginTop: '2px',
  },
  viewAdLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#00a49f',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  emptyMessages: {
    margin: 'auto',
    textAlign: 'center',
    padding: '20px',
  },
  msgRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  bubbleImg: {
    maxWidth: '200px',
    borderRadius: '6px',
    marginBottom: '6px',
  },
  bubbleText: {
    fontSize: '13.5px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  bubbleMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    fontSize: '10px',
    marginTop: '3px',
  },
  footer: {
    padding: '14px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
  },
  previewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '11px',
    marginBottom: '8px',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  attachBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '13.5px',
    color: '#0f172a',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
  },
}
