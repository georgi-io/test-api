package io.georgi.testapi

import akka.actor.ActorSystem
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.{Http, ServerBuilder}
import akka.http.scaladsl.model.{ContentTypes, HttpEntity}
import akka.http.scaladsl.server.Directives.logRequestResult
import akka.http.scaladsl.server.Route
import com.typesafe.config.{Config, ConfigFactory}
import akka.http.scaladsl.model.StatusCodes.*
import akka.http.scaladsl.server.Directives.*

import scala.concurrent.ExecutionContext
import scala.io.StdIn

case class Message(message: String)

trait API:
  implicit val system: ActorSystem

  implicit def executor: ExecutionContext

  def config: Config

  val logger: LoggingAdapter

  val route: Route =
    path("")(get(complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, "Test API Result"))))


object TestAPI extends App with API :
  override implicit val system: ActorSystem = ActorSystem("test-api-system")

  override implicit def executor: ExecutionContext = system.dispatcher

  override val logger = Logging(system, "test-api")
  override val config = ConfigFactory.load()

  logger.info("TestAPI is starting")
  val bindingFuture = Http().newServerAt(config.getString("http.interface"), config.getInt("http.port")).bind(route)



