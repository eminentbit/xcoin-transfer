import { useForm } from "react-hook-form";
import { Mail, Phone, MessageSquare, Clock, Send } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { ContactFormData } from "../../utils/types";
import FloatingWhatsapp from "../FloatingWhatsapp";

const ContactSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();
  const number = "+237672696261";

  const onSubmit = (data: ContactFormData) => {
    if (import.meta.env.DEV) {
      console.log("Form submitted:", data);
    }
  };

  return (
    <div
      id="contact"
      className="bg-gradient-to-b from-gray-50 to-white py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our XAF to RMB conversion service? Our team is
            here to help 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Quick Contact Options */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">xcoin-service@outlook.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">+86 131 3063 7422</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3"
                  onClick={() => {
                    const message =
                      "Hello There, I wish to find at about your Xcoin transfer services.";
                    open(`https://wa.me/${number}?text=${message}`, "_blank");
                  }}
                >
                  <div className="bg-blue-50 p-3 rounded-full cursor-pointer">
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Whatsapp</p>
                    <p className="text-gray-900">{number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Live Chat</p>
                    <p className="text-gray-900">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2">
                <p className="flex justify-between text-gray-600">
                  <span>Monday - Friday:</span>
                  <span>24 hours</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Saturday:</span>
                  <span>24 hours</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Sunday:</span>
                  <span>24 hours</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    {...register("message", {
                      required: "Message is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <FloatingWhatsapp phone={number} />
    </div>
  );
};

export default ContactSection;
