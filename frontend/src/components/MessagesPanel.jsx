import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MessagesPanel({ isOpen, onClose }) {
  const navigate = useNavigate()
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
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await conversationsAPI.getAll()
      setConversations(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
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
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
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
      console.error('Failed to send message:', err)
      setMessageInput(text)
      setSelectedImage(image)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await conversationsAPI.deleteMessage(activeConversation.id, messageId)
      await fetchMessages(activeConversation.id)
      await fetchConversations()
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const getOtherUser = (conv) => {
    if (!conv || !user) return null
    return conv.other_user
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            style={styles.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <h3>Messages</h3>
              <motion.button
                onClick={onClose}
                style={styles.closeBtn}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            <div style={styles.content}>
              <div style={styles.sidebar}>
                {loading ? (
                  <div style={styles.loadingText}>Loading...</div>
                ) : conversations.length === 0 ? (
                  <div style={styles.emptyText}>No messages yet</div>
                ) : (
                  conversations.map((conv, index) => (
                    <motion.div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      style={{
                        ...styles.conversationItem,
                        ...(activeConversation?.id === conv.id ? styles.activeConv : {})
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#f8f9fa' }}
                    >
                      <div style={styles.convInfo}>
                        <strong>{getOtherUser(conv)?.username}</strong>
                        <div style={styles.convProduct}>{conv.product?.name}</div>
                        <div style={styles.convLastMsg}>{conv.last_message?.message || (conv.last_message?.image ? '📷 Photo' : 'No messages')}</div>
                      </div>
                      {conv.unread_count > 0 && (
                        <motion.span
                          style={styles.badge}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          {conv.unread_count}
                        </motion.span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div style={styles.chatArea}>
                {activeConversation ? (
                  <>
                    <motion.div
                      style={styles.chatHeader}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <strong>{getOtherUser(activeConversation)?.username}</strong>
                      <div style={styles.chatProduct}>{activeConversation.product?.name}</div>
                    </motion.div>

                    <div style={styles.messagesList}>
                      <AnimatePresence>
                        {messages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            style={{
                              ...styles.messageBubble,
                              ...(msg.sender_id === user?.id ? styles.myMsg : styles.theirMsg)
                            }}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                          >
                            {msg.image_url && (
                              <motion.img
                                src={msg.image_url}
                                alt=""
                                style={styles.messageImage}
                                whileHover={{ scale: 1.02 }}
                              />
                            )}
                            {msg.message && <div style={styles.messageText}>{msg.message}</div>}
                            <div style={styles.messageFooter}>
                              <span style={styles.messageTime}>{formatTime(msg.created)}</span>
                              {msg.sender_id === user?.id && (
                                <motion.button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  style={styles.deleteBtn}
                                  title="Delete message"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  🗑️
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>

                    <AnimatePresence>
                      {imagePreview && (
                        <motion.div
                          style={styles.imagePreview}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                          <motion.button
                            onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                            style={styles.removeImageBtn}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✕
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage} style={styles.messageForm}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={styles.imageBtn}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        📷
                      </motion.button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        style={styles.messageInput}
                        disabled={sending}
                      />
                      <motion.button
                        type="submit"
                        disabled={sending || (!messageInput.trim() && !selectedImage)}
                        style={styles.sendBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Send
                      </motion.button>
                    </form>
                  </>
                ) : (
                  <motion.div
                    style={styles.noChat}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div style={styles.noChatIcon}>&#128172;</div>
                    <p>Select a conversation</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  panel: {
    width: '33%',
    minWidth: '350px',
    maxWidth: '450px',
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  closeBtn: {
    background: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '40%',
    borderRight: '1px solid #e9ecef',
    overflow: 'auto',
  },
  loadingText: {
    padding: '20px',
    textAlign: 'center',
    color: '#b2bec3',
  },
  emptyText: {
    padding: '20px',
    textAlign: 'center',
    color: '#b2bec3',
  },
  conversationItem: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeConv: {
    backgroundColor: '#f8f9fa',
  },
  convInfo: { flex: 1, minWidth: 0 },
  convProduct: { fontSize: '11px', color: '#636e72' },
  convLastMsg: { fontSize: '12px', color: '#b2bec3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  badge: { backgroundColor: '#e94560', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#fff',
  },
  chatProduct: { fontSize: '12px', color: '#636e72' },
  messagesList: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#f8f9fa',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '16px',
    wordWrap: 'break-word',
  },
  myMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#e94560',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  theirMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    color: '#1a1a2e',
    borderBottomLeftRadius: '4px',
  },
  messageText: { fontSize: '13px', lineHeight: 1.4 },
  messageTime: { fontSize: '10px', opacity: 0.7 },
  messageFooter: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
  deleteBtn: { background: 'none', fontSize: '12px', cursor: 'pointer', opacity: 0.7, padding: '2px' },
  messageImage: { maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginBottom: '4px' },
  imagePreview: { position: 'relative', padding: '8px 12px', backgroundColor: '#fff', borderTop: '1px solid #e9ecef' },
  previewImage: { maxWidth: '80px', maxHeight: '80px', borderRadius: '8px' },
  removeImageBtn: { position: 'absolute', top: '8px', left: '100px', backgroundColor: '#e94560', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  messageForm: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#fff',
  },
  imageBtn: {
    backgroundColor: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '18px',
  },
  messageInput: {
    flex: 1,
    padding: '8px 14px',
    border: '2px solid #e9ecef',
    borderRadius: '20px',
    fontSize: '13px',
  },
  sendBtn: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '13px',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)',
  },
  noChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b2bec3',
  },
  noChatIcon: { fontSize: '48px', marginBottom: '12px', opacity: 0.5 },
}
